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

export async function PUT(
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
    const body = await req.json();

    const service = await Service.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Hizmet bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error('Service update error:', error);
    return NextResponse.json(
      { error: 'Güncelleme başarısız' },
      { status: 400 }
    );
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

    const service = await Service.findByIdAndDelete(params.id);

    if (!service) {
      return NextResponse.json(
        { error: 'Hizmet bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Service delete error:', error);
    return NextResponse.json(
      { error: 'Silme başarısız' },
      { status: 400 }
    );
  }
}
