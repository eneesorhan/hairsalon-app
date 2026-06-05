import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getAppointmentStats } from '@/lib/timeslot-service';
import { Service } from '@/models/Service';
import { getDateInDays } from '@/lib/time';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.API_SECRET || 'your-secret-key';

function verifyToken(req: NextRequest): boolean {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.substring(7);
    verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!verifyToken(req)) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    await connectDB();

    const { Appointment } = await import('@/models/Appointment');

    // Tüm zamanlar için toplam istatistikler
    const [completedAppointments, serviceCount] = await Promise.all([
      Appointment.find({ status: 'completed' }).lean(),
      Service.countDocuments({ isActive: true }),
    ]);

    const totalAppointments = completedAppointments.length;
    const totalRevenue = completedAppointments.reduce((sum: number, a: any) => sum + (a.totalPrice || 0), 0);

    // En yoğun saat: son 90 günden
    const fromDate = getDateInDays(-90);
    const toDate = getDateInDays(365);
    const raw = await getAppointmentStats(fromDate, toDate);

    const busiestHour = raw.byHour.length > 0
      ? raw.byHour.reduce((a: any, b: any) => (a.count > b.count ? a : b))._id
      : null;

    return NextResponse.json({
      totalAppointments,
      busiestHour,
      totalRevenue,
      serviceCount,
      byHour: raw.byHour,
      byDay: raw.byDay,
      byService: raw.byService,
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { error: 'İstatistikler yüklenemedi' },
      { status: 500 }
    );
  }
}
