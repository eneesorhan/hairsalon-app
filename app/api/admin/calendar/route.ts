import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Appointment } from '@/models/Appointment';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.API_SECRET || 'your-secret-key';

function verifyToken(req: NextRequest): boolean {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return false;
    verify(authHeader.substring(7), JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

// GET /api/admin/calendar?year=2026&month=6
export async function GET(req: NextRequest) {
  try {
    if (!verifyToken(req)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));

    const fromDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const toDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const appointments = await Appointment.find({
      date: { $gte: fromDate, $lte: toDate },
      status: { $ne: 'cancelled' },
    })
      .populate('serviceId', 'name price')
      .sort({ startTime: 1 })
      .lean();

    // Group by date
    const byDate: Record<string, typeof appointments> = {};
    for (const apt of appointments) {
      if (!byDate[apt.date]) byDate[apt.date] = [];
      byDate[apt.date].push(apt);
    }

    return NextResponse.json({ byDate, year, month });
  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json({ error: 'Takvim yüklenemedi' }, { status: 500 });
  }
}
