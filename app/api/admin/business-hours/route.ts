import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { BusinessHours } from '@/models/BusinessHours';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.API_SECRET || 'your-secret-key';

function verifyToken(req: NextRequest): boolean {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
    verify(authHeader.substring(7), JWT_SECRET);
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
    const hours = await BusinessHours.find().sort({ dayOfWeek: 1 });
    return NextResponse.json(hours);
  } catch (error) {
    console.error('BusinessHours fetch error:', error);
    return NextResponse.json({ error: 'Çalışma saatleri yüklenemedi' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!verifyToken(req)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }
    await connectDB();
    const updates: Array<{
      dayOfWeek: number;
      dayName: string;
      isOpen: boolean;
      openTime: string;
      closeTime: string;
      breakStart?: string;
      breakEnd?: string;
    }> = await req.json();

    const results = await Promise.all(
      updates.map((day) =>
        BusinessHours.findOneAndUpdate(
          { dayOfWeek: day.dayOfWeek },
          day,
          { upsert: true, new: true }
        )
      )
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error('BusinessHours update error:', error);
    return NextResponse.json({ error: 'Güncelleme başarısız' }, { status: 500 });
  }
}
