import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { AdminUser } from '@/models/AdminUser';
import bcrypt from 'bcryptjs';

export async function POST(_req: NextRequest) {
  try {
    await connectDB();

    const existingAdmin = await AdminUser.findOne({ username: 'admin' });
    if (existingAdmin) {
      return NextResponse.json({ message: 'Admin kullanıcısı zaten mevcut' });
    }

    const passwordHash = await bcrypt.hash('admin123', 10);
    await AdminUser.create({
      username: 'admin',
      email: 'admin@hairsalon.com',
      passwordHash,
      role: 'admin',
      isActive: true,
    });

    return NextResponse.json({ message: 'Admin kullanıcısı oluşturuldu' });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: 'Setup başarısız' }, { status: 500 });
  }
}
