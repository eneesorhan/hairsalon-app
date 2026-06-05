import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not defined');
}

let cached = global as any;

if (!cached.mongoose) {
  cached.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.mongoose.conn) {
    return cached.mongoose.conn;
  }

  if (!cached.mongoose.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.mongoose.promise = mongoose
      .connect(MONGODB_URI as string, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB bağlantısı başarılı');
        return mongoose;
      })
      .catch((err) => {
        console.error('❌ MongoDB bağlantı hatası:', err);
        throw err;
      });
  }

  cached.mongoose.conn = await cached.mongoose.promise;
  return cached.mongoose.conn;
}

export async function disconnectDB() {
  if (cached.mongoose.conn) {
    await cached.mongoose.conn.disconnect();
    cached.mongoose.conn = null;
  }
}
