import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { AdminUser } from '@/models/AdminUser';
import { sign } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.API_SECRET || 'your-secret-key';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Kullanıcı adı ve şifre gereklidir' },
        { status: 400 }
      );
    }

    // Kullanıcıyı bul
    const user = await AdminUser.findOne({ username });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 401 }
      );
    }

    // Şifre kontrolü (basit kontrol, üretim da bcrypt kullanınız)
    const passwordMatch = password === user.passwordHash || 
      (await bcrypt.compare(password, user.passwordHash).catch(() => false));

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Şifre yanlış' },
        { status: 401 }
      );
    }

    // Token oluştur
    const token = sign(
      { userId: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // LastLogin'i güncelle
    user.lastLogin = new Date();
    await user.save();

    return NextResponse.json({ token, user });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Giriş başarısız' },
      { status: 500 }
    );
  }
}
