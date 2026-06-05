import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';
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

const settingsSchema = new mongoose.Schema(
  { key: { type: String, unique: true }, value: String },
  { collection: 'settings' }
);

const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

export async function GET(req: NextRequest) {
  try {
    if (!verifyToken(req)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    await connectDB();
    const all = await Settings.find().lean();
    const result: Record<string, string> = {};
    for (const s of all as Array<{ key: string; value: string }>) result[s.key] = s.value;
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Ayarlar yüklenemedi' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!verifyToken(req)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    await connectDB();
    const body: Record<string, string> = await req.json();
    await Promise.all(
      Object.entries(body).map(([key, value]) =>
        Settings.findOneAndUpdate({ key }, { key, value }, { upsert: true, new: true })
      )
    );
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Kaydetme başarısız' }, { status: 500 });
  }
}
