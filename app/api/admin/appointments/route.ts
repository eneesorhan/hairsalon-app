import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Appointment } from '@/models/Appointment';
import { TimeSlot } from '@/models/TimeSlot';
import { releaseTimeSlot, bookTimeSlot } from '@/lib/timeslot-service';
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
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    const skip = (page - 1) * limit;

    const appointments = await Appointment.find()
      .populate('serviceId')
      .sort({ date: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Appointment.countDocuments();

    return NextResponse.json({
      appointments,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Appointments fetch error:', error);
    return NextResponse.json(
      { error: 'Randevular yüklenemedi' },
      { status: 500 }
    );
  }
}

// Walk-in randevu ekle veya saati dolu işaretle
export async function POST(req: NextRequest) {
  try {
    if (!verifyToken(req)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { date, startTime, isWalkIn, notes } = body;

    if (!date || !startTime) {
      return NextResponse.json(
        { error: 'Tarih ve saat gereklidir' },
        { status: 400 }
      );
    }

    // Walk-in saatini dolu olarak işaretle
    await bookTimeSlot(date, startTime, undefined, isWalkIn, notes);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Appointment creation error:', error);
    return NextResponse.json(
      { error: 'İşlem başarısız' },
      { status: 500 }
    );
  }
}
