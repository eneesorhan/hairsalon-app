import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Service } from '@/models/Service';

export async function GET() {
  try {
    await connectDB();
    const services = await Service.find({ isActive: true }).sort({ category: 1 });
    return NextResponse.json(services);
  } catch (error) {
    console.error('Services API error:', error);
    return NextResponse.json(
      { error: 'Hizmetler yüklenemedi' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
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
