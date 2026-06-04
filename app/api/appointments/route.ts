import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Appointment } from '@/models/Appointment';
import { Service } from '@/models/Service';
import { bookTimeSlot } from '@/lib/timeslot-service';
import { sendAppointmentConfirmation } from '@/services/email';
import { calculateEndTime, isTimeInFuture } from '@/lib/time';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const { serviceId, date, startTime, customerName, customerEmail, customerPhone, notes } = body;

    // Validasyon
    if (!serviceId || !date || !startTime || !customerName || !customerEmail || !customerPhone) {
      return NextResponse.json(
        { error: 'Tüm gerekli alanları doldurunuz' },
        { status: 400 }
      );
    }

    // Geçmiş saatleri kontrol et
    if (!isTimeInFuture(date, startTime)) {
      return NextResponse.json(
        { error: 'Geçmiş bir tarih/saat seçemezsiniz' },
        { status: 400 }
      );
    }

    // Hizmet bilgisini al
    const service = await Service.findById(serviceId);
    if (!service) {
      return NextResponse.json(
        { error: 'Hizmet bulunamadı' },
        { status: 404 }
      );
    }

    // Randevu oluştur
    const endTime = calculateEndTime(startTime, service.duration);
    const appointment = await Appointment.create({
      serviceId,
      date,
      startTime,
      endTime,
      customerName,
      customerEmail,
      customerPhone,
      notes,
      status: 'pending',
      totalPrice: service.price,
    });

    // TimeSlot'u dolu olarak işaretle
    await bookTimeSlot(date, startTime, appointment._id.toString(), false, notes);

    // Onay e-postası gönder
    try {
      await sendAppointmentConfirmation(
        appointment._id.toString(),
        customerEmail,
        customerName,
        service.name,
        date,
        startTime
      );
      appointment.confirmationEmailSent = true;
      await appointment.save();
    } catch (emailError) {
      console.error('Email gönderme hatası:', emailError);
      // E-posta hatası randevu oluşturmayı başarısız yapmasın
    }

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('Appointment creation error:', error);
    return NextResponse.json(
      { error: 'Randevu oluşturulamadı' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    let query = {};
    if (email) {
      query = { customerEmail: email };
    }

    const appointments = await Appointment.find(query)
      .populate('serviceId')
      .sort({ date: -1 });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Appointments fetch error:', error);
    return NextResponse.json(
      { error: 'Randevular yüklenemedi' },
      { status: 500 }
    );
  }
}
