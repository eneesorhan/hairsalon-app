/**
 * Database Seed Script
 * 
 * Kullanım:
 * node scripts/seed.js
 * 
 * Bu script varsayılan veri ile veritabanını doldurur:
 * - 5 Hizmet (Saç Kesimi, Boyama, Styling, Bakım, VIP)
 * - İşletme Saatleri (Pazartesi-Cumartesi 09:00-18:00)
 * - Test Admin Hesabı (admin / admin123)
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

// Models (basit tanım)
const serviceSchema = new mongoose.Schema({
  name: String,
  description: String,
  duration: Number,
  price: Number,
  category: String,
  isActive: Boolean,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const businessHoursSchema = new mongoose.Schema({
  dayOfWeek: Number,
  dayName: String,
  openTime: String,
  closeTime: String,
  isOpen: Boolean,
  breakStart: String,
  breakEnd: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { collection: 'business_hours' });

const adminUserSchema = new mongoose.Schema({
  username: String,
  email: String,
  passwordHash: String,
  role: { type: String, default: 'admin' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Service = mongoose.model('Service', serviceSchema);
const BusinessHours = mongoose.model('BusinessHours', businessHoursSchema);
const AdminUser = mongoose.model('AdminUser', adminUserSchema);

async function seed() {
  try {
    console.log('MongoDB bağlanıyor...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı');

    // Mevcut verileri temizle
    console.log('\nMevcut veriler temizleniyor...');
    await Service.deleteMany({});
    await BusinessHours.deleteMany({});
    await AdminUser.deleteMany({});

    // Hizmetleri ekle
    console.log('Hizmetler ekleniyor...');
    const services = [
      {
        name: 'Saç Kesimi',
        description: 'Modern ve trendy saç kesim hizmetleri',
        duration: 60,
        price: 30,
        category: 'cutting',
        isActive: true,
      },
      {
        name: 'Saç Boyama',
        description: 'Profesyonel saç boyama ve renk değişimi',
        duration: 120,
        price: 55,
        category: 'coloring',
        isActive: true,
      },
      {
        name: 'Styling & Tasarım',
        description: 'Özel tasarım ve styling hizmetleri',
        duration: 90,
        price: 45,
        category: 'styling',
        isActive: true,
      },
      {
        name: 'Saç Bakım Tedavisi',
        description: 'Onarıcı ve besleyici saç bakım',
        duration: 45,
        price: 28,
        category: 'treatment',
        isActive: true,
      },
      {
        name: 'VIP Paketi',
        description: 'Kesim + Boyama + Styling - Tüm paket',
        duration: 180,
        price: 100,
        category: 'other',
        isActive: true,
      },
    ];

    await Service.insertMany(services);
    console.log(`✅ ${services.length} hizmet eklendi`);

    // İşletme Saatlerini ekle
    console.log('İşletme saatleri ekleniyor...');
    const businessHours = [
      {
        dayOfWeek: 0,
        dayName: 'Sunday',
        openTime: '11:00',
        closeTime: '17:00',
        isOpen: true,
      },
      {
        dayOfWeek: 1,
        dayName: 'Monday',
        openTime: '09:00',
        closeTime: '18:00',
        isOpen: true,
        breakStart: '13:00',
        breakEnd: '14:00',
      },
      {
        dayOfWeek: 2,
        dayName: 'Tuesday',
        openTime: '09:00',
        closeTime: '18:00',
        isOpen: true,
        breakStart: '13:00',
        breakEnd: '14:00',
      },
      {
        dayOfWeek: 3,
        dayName: 'Wednesday',
        openTime: '09:00',
        closeTime: '18:00',
        isOpen: true,
        breakStart: '13:00',
        breakEnd: '14:00',
      },
      {
        dayOfWeek: 4,
        dayName: 'Thursday',
        openTime: '09:00',
        closeTime: '18:00',
        isOpen: true,
        breakStart: '13:00',
        breakEnd: '14:00',
      },
      {
        dayOfWeek: 5,
        dayName: 'Friday',
        openTime: '09:00',
        closeTime: '19:00',
        isOpen: true,
        breakStart: '13:00',
        breakEnd: '14:00',
      },
      {
        dayOfWeek: 6,
        dayName: 'Saturday',
        openTime: '10:00',
        closeTime: '17:00',
        isOpen: true,
        breakStart: '13:00',
        breakEnd: '13:30',
      },
    ];

    await BusinessHours.insertMany(businessHours);
    console.log(`✅ ${businessHours.length} işletme saati eklendi`);

    // Admin hesabı ekle
    console.log('Admin hesabı oluşturuluyor...');
    const adminUser = {
      username: 'admin',
      email: 'admin@hairsalon.com',
      passwordHash: 'admin123', // Üretimde bcrypt kullanınız!
      role: 'admin',
      isActive: true,
    };

    await AdminUser.create(adminUser);
    console.log('✅ Admin hesabı oluşturuldu (Kullanıcı: admin / Şifre: admin123)');

    console.log('\n✨ Veritabanı başarılı şekilde seed yapıldı!');
    console.log('\nSonraki adımlar:');
    console.log('1. npm run dev ile sunucuyu başlatın');
    console.log('2. http://localhost:3000 adresine gidin');
    console.log('3. Admin panelinde giriş yapın: admin / admin123');

  } catch (error) {
    console.error('❌ Seed hatası:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nMongoDB bağlantısı kapatıldı');
  }
}

seed();
