import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Appointment } from '@/models/Appointment';
import { releaseTimeSlot } from '@/lib/timeslot-service';
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!verifyToken(req)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    await connectDB();
    const { status } = await req.json();

    const appointment = await Appointment.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    ).populate('serviceId');

    if (!appointment) {
      return NextResponse.json({ error: 'Randevu bulunamadı' }, { status: 404 });
    }

    if (status === 'cancelled') {
      await releaseTimeSlot(appointment.date, appointment.startTime);
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Appointment update error:', error);
    return NextResponse.json({ error: 'Güncelleme başarısız' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!verifyToken(req)) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    await connectDB();

    const appointment = await Appointment.findById(params.id);

    if (!appointment) {
      return NextResponse.json(
        { error: 'Randevu bulunamadı' },
        { status: 404 }
      );
    }

    // TimeSlot'u boşalt
    await releaseTimeSlot(appointment.date, appointment.startTime);

    // Randevuyu sil
    await Appointment.deleteOne({ _id: params.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Appointment delete error:', error);
    return NextResponse.json(
      { error: 'Silme başarısız' },
      { status: 500 }
    );
  }
}
