import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Service } from '@/models/Service';
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
    const services = await Service.find().sort({ createdAt: -1 });
    return NextResponse.json(services);
  } catch (error) {
    console.error('Services fetch error:', error);
    return NextResponse.json({ error: 'Hizmetler yüklenemedi' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!verifyToken(req)) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await req.json();

    const service = await Service.create(body);
    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error('Service creation error:', error);
    return NextResponse.json(
      { error: 'Hizmet oluşturulamadı' },
      { status: 400 }
    );
  }
}
