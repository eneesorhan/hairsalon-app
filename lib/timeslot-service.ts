import { TimeSlot } from '@/models/TimeSlot';
import { BusinessHours } from '@/models/BusinessHours';
import { Appointment } from '@/models/Appointment';
import { connectDB } from '@/lib/db';
import {
  calculateEndTime,
  getDayOfWeek,
  isTimeInFuture,
  getLondonTime,
} from '@/lib/time';

/**
 * Belirtilen tarih için mevcut saatleri döndür
 */
export async function getAvailableSlots(
  dateStr: string,
  serviceDuration: number
): Promise<Array<{ startTime: string; endTime: string; isAvailable: boolean }>> {
  await connectDB();

  const dayOfWeek = getDayOfWeek(dateStr);

  // İşletme saatlerini al
  const businessHours = await BusinessHours.findOne({ dayOfWeek });

  if (!businessHours || !businessHours.isOpen) {
    return [];
  }

  // Geçmiş tarihler için slot döndürme
  if (isDatePast(dateStr)) {
    return [];
  }

  const slots = generateTimeSlots(
    businessHours.openTime,
    businessHours.closeTime,
    serviceDuration,
    businessHours.breakStart,
    businessHours.breakEnd
  );

  // Veritabanındaki dolu slotları kontrol et
  const bookedSlots = await TimeSlot.find({
    date: dateStr,
    isBooked: true,
  });

  const bookedTimes = bookedSlots.map((slot) => slot.startTime);

  return slots.map((slot) => ({
    startTime: slot,
    endTime: calculateEndTime(slot, serviceDuration),
    isAvailable:
      !bookedTimes.includes(slot) && isTimeInFuture(dateStr, slot),
  }));
}

/**
 * Bir saati dolu olarak işaretle (Randevu oluştur veya Walk-in)
 */
export async function bookTimeSlot(
  dateStr: string,
  startTime: string,
  appointmentId?: string,
  isWalkIn: boolean = false,
  notes?: string
): Promise<void> {
  await connectDB();

  const endTime = calculateEndTime(startTime, 60); // 1 saatlik slot

  const existingSlot = await TimeSlot.findOne({
    date: dateStr,
    startTime,
  });

  if (existingSlot && existingSlot.isBooked) {
    throw new Error('Bu saat zaten dolu');
  }

  if (existingSlot) {
    existingSlot.isBooked = true;
    existingSlot.appointmentId = appointmentId ? require('mongoose').Types.ObjectId(appointmentId) : null;
    existingSlot.isWalkIn = isWalkIn;
    existingSlot.notes = notes;
    await existingSlot.save();
  } else {
    await TimeSlot.create({
      date: dateStr,
      startTime,
      endTime,
      isBooked: true,
      appointmentId,
      isWalkIn,
      notes,
    });
  }
}

/**
 * Bir slotu boşalt (Randevu iptal edildiğinde)
 */
export async function releaseTimeSlot(dateStr: string, startTime: string): Promise<void> {
  await connectDB();

  await TimeSlot.updateOne(
    { date: dateStr, startTime },
    {
      isBooked: false,
      appointmentId: null,
      isWalkIn: false,
      notes: null,
    }
  );
}

/**
 * Belirtilen tarih aralığı için tüm slotları oluştur
 */
export async function generateTimeSlotsSeed(
  fromDate: string,
  toDate: string
): Promise<void> {
  await connectDB();

  const startDate = getLondonTime(fromDate);
  const endDate = getLondonTime(toDate);
  let currentDate = startDate;

  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
    const dateStr = currentDate.format('YYYY-MM-DD');
    const dayOfWeek = currentDate.day();

    const businessHours = await BusinessHours.findOne({ dayOfWeek });

    if (businessHours && businessHours.isOpen) {
      const slots = generateTimeSlots(
        businessHours.openTime,
        businessHours.closeTime,
        60, // 1 saatlik slotlar
        businessHours.breakStart,
        businessHours.breakEnd
      );

      for (const slot of slots) {
        const endTime = calculateEndTime(slot, 60);

        try {
          await TimeSlot.updateOne(
            { date: dateStr, startTime: slot },
            {
              date: dateStr,
              startTime: slot,
              endTime,
              isBooked: false,
            },
            { upsert: true }
          );
        } catch (error) {
          console.error(`Slot oluşturma hatası: ${dateStr} ${slot}`, error);
        }
      }
    }

    currentDate = currentDate.add(1, 'day');
  }
}

/**
 * Tarih kontrolü: geçmiş mi?
 */
function isDatePast(dateStr: string): boolean {
  return getLondonTime(dateStr).isBefore(getLondonTime(), 'day');
}

/**
 * Saat aralığını verilen süreye göre slotlara böl
 * breakStart ve breakEnd arasını atlı
 */
function generateTimeSlots(
  openTime: string,
  closeTime: string,
  slotDuration: number,
  breakStart?: string,
  breakEnd?: string
): string[] {
  const slots: string[] = [];
  let currentTime = getLondonTime(`2024-01-01 ${openTime}`, 'YYYY-MM-DD HH:mm');
  const closeTimeObj = getLondonTime(`2024-01-01 ${closeTime}`, 'YYYY-MM-DD HH:mm');

  while (currentTime.add(slotDuration, 'minute').isSameOrBefore(closeTimeObj)) {
    const timeStr = currentTime.format('HH:mm');

    // Mola saatini kontrol et
    if (breakStart && breakEnd) {
      const breakStartObj = getLondonTime(`2024-01-01 ${breakStart}`, 'YYYY-MM-DD HH:mm');
      const breakEndObj = getLondonTime(`2024-01-01 ${breakEnd}`, 'YYYY-MM-DD HH:mm');

      if (currentTime.isSameOrAfter(breakStartObj) && currentTime.isBefore(breakEndObj)) {
        currentTime = breakEndObj;
        continue;
      }
    }

    slots.push(timeStr);
    currentTime = currentTime.add(slotDuration, 'minute');
  }

  return slots;
}

/**
 * Randevu istatistikleri (grafiksel gösterim için)
 */
export async function getAppointmentStats(fromDate: string, toDate: string) {
  await connectDB();

  // Saate göre dağılım
  const byHour = await Appointment.aggregate([
    {
      $match: {
        date: { $gte: fromDate, $lte: toDate },
        status: { $ne: 'cancelled' },
      },
    },
    {
      $group: {
        _id: '$startTime',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Güne göre dağılım
  const byDay = await Appointment.aggregate([
    {
      $match: {
        date: { $gte: fromDate, $lte: toDate },
        status: { $ne: 'cancelled' },
      },
    },
    {
      $group: {
        _id: '$date',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Hizmet kategorisine göre dağılım
  const byService = await Appointment.aggregate([
    {
      $match: {
        date: { $gte: fromDate, $lte: toDate },
        status: { $ne: 'cancelled' },
      },
    },
    {
      $lookup: {
        from: 'services',
        localField: 'serviceId',
        foreignField: '_id',
        as: 'service',
      },
    },
    {
      $unwind: '$service',
    },
    {
      $group: {
        _id: '$service.name',
        count: { $sum: 1 },
        revenue: { $sum: '$totalPrice' },
      },
    },
  ]);

  return {
    byHour,
    byDay,
    byService,
    totalAppointments: byDay.reduce((acc, day) => acc + day.count, 0),
  };
}
