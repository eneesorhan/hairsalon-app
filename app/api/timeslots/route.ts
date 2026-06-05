import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getAvailableSlots } from '@/lib/timeslot-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const duration = parseInt(searchParams.get('duration') || '60');

    if (!date) {
      return NextResponse.json(
        { error: 'Tarih gereklidir' },
        { status: 400 }
      );
    }

    await connectDB();
    const slots = await getAvailableSlots(date, duration);
    return NextResponse.json(slots);
  } catch (error) {
    console.error('Timeslots API error:', error);
    return NextResponse.json(
      { error: 'Saatler yüklenemedi' },
      { status: 500 }
    );
  }
}
