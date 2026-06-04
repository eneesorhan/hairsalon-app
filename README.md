# Hair Salon Pro - Full-Stack Randevu Yönetim Sistemi

Modern, şık ve unisex kuaför salonu için çevrimiçi randevu sistemi. Next.js, MongoDB, Tailwind CSS ve Shadcn/UI ile geliştirilmiştir.

## 🎯 Özellikler

### 👥 Müşteri Tarafı
- ✅ **Çevrimiçi Randevu Sistemi**: 7/24 online randevu alma
- ✅ **Hizmet Seçimi**: Çeşitli saç hizmetlerinden seçim
- ✅ **Takvim Yönetimi**: 1 saatlik sabit bloklar halinde müsaitlik görüntüleme
- ✅ **Otomatik Bildirimler**: E-posta ve WhatsApp mesajları

### 👨‍💼 Admin Tarafı
- ✅ **Dashboard**: Randevu istatistikleri ve grafik gösterimler
- ✅ **Randevu Yönetimi**: Tüm randevuları görüntüleme, düzenleme, iptal etme
- ✅ **Walk-in Yönetimi**: Direkt gelen müşteriler için saatleri dolu işaretleme
- ✅ **Hizmet Yönetimi**: Hizmet ekleme, düzenleme, fiyat belirleme
- ✅ **Fotoğraf Galerisi**: Hizmetlere ait fotoğraf yönetimi

### 📊 Analitikler
- 📈 Saate göre randevu dağılımı
- 📈 Güne göre yoğunluk analizi
- 💷 Hizmet bazında gelir takibi
- 🎯 En popüler hizmetler

## 🚀 Teknoloji Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS 3, Shadcn/UI
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **ORM**: Mongoose
- **Authentication**: JWT (JSON Web Token)
- **Email**: Nodemailer + SMTP
- **Notifications**: WhatsApp (wa.me links)
- **Time Management**: dayjs (London timezone)
- **Charts**: Recharts

## 📋 Kurulum

### Gereksinimler
- Node.js 18+
- MongoDB (local veya Atlas)
- Git

### Adımlar

1. **Repoyu Klonla**
   ```bash
   cd /home/enes/Projeler/hairsalon-app
   ```

2. **Dependencies Yükle**
   ```bash
   npm install
   ```

3. **Environment Değişkenlerini Ayarla**
   ```bash
   cp .env.local.example .env.local
   ```
   
   `.env.local` dosyasını düzenle:
   ```env
   MONGODB_URI=mongodb://localhost:27017/hairsalon
   MONGODB_DB=hairsalon
   NEXT_PUBLIC_API_URL=http://localhost:3000
   API_SECRET=your-super-secret-key-here
   
   # Email Konfigürasyonu (Gmail örneği)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   SMTP_FROM_EMAIL=noreply@yourmail.com
   SMTP_FROM_NAME=Hair Salon Pro
   
   WHATSAPP_BUSINESS_PHONE=YOUR_PHONE_NUMBER
   ```

4. **MongoDB Veritabanını Başlat**
   ```bash
   # MongoDB Community Edition (local)
   mongod
   
   # veya MongoDB Atlas kullanın
   ```

5. **Development Sunucusunu Başlat**
   ```bash
   npm run dev
   ```
   
   Browser'ı `http://localhost:3000` adresine açın

## 📂 Proje Yapısı

```
hairsalon-app/
├── app/                          # Next.js App Router
│   ├── (admin)/                  # Admin layout grubu
│   │   ├── login/               # Admin giriş
│   │   ├── dashboard/           # Admin dashboard
│   │   ├── appointments/        # Randevu yönetimi
│   │   └── services/            # Hizmet yönetimi
│   ├── (customer)/              # Müşteri layout grubu
│   │   └── appointment/         # Randevu alma sistemi
│   ├── api/                      # API rotaları
│   │   ├── services/            # Hizmet API
│   │   ├── timeslots/           # Saat API
│   │   ├── appointments/        # Randevu API
│   │   └── admin/               # Admin API
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Anasayfa
│   ├── globals.css              # Global stiller
│   └── providers.tsx            # Context providers
├── models/                       # Mongoose şemaları
│   ├── Service.ts               # Hizmet modeli
│   ├── Appointment.ts           # Randevu modeli
│   ├── TimeSlot.ts              # Zaman slotu modeli
│   ├── ServiceGallery.ts        # Fotoğraf galerisi
│   ├── BusinessHours.ts         # İşletme saatleri
│   ├── AdminUser.ts             # Admin kullanıcı
│   └── Notification.ts          # Bildirim logları
├── services/                    # İş mantığı servisleri
│   ├── email.ts                 # Email gönderimi
│   └── whatsapp.ts              # WhatsApp entegrasyonu
├── lib/                         # Yardımcı kütüphaneler
│   ├── db.ts                    # MongoDB bağlantısı
│   ├── time.ts                  # Zaman/timezone yönetimi
│   └── timeslot-service.ts      # Slot yönetim servisi
├── components/                  # Reusable React bileşenleri
├── public/                      # Statik dosyalar
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
└── postcss.config.js
```

## 🔑 Ana API Endpoints

### Müşteri API'si
- `GET /api/services` - Hizmetleri listele
- `GET /api/timeslots?date=2026-01-15&duration=60` - Boş saatleri al
- `POST /api/appointments` - Randevu oluştur
- `GET /api/appointments?email=user@email.com` - Müşteri randevuları

### Admin API'si
- `POST /api/admin/auth` - Admin giriş
- `GET /api/admin/stats` - İstatistikler
- `GET /api/admin/appointments` - Tüm randevuları listele
- `POST /api/admin/appointments` - Walk-in saati işaretle

## 👨‍💻 Geliştirme Rehberi

### 1. **Yeni Hizmet Ekleme**
   - Admin dashboard → Hizmetler
   - Hizmet adı, açıklama, fiyat ve süre girin
   - Fotoğrafları galeriye yükleyin

### 2. **İşletme Saatlerini Ayarlama**
   - Admin → Ayarlar
   - Hafta günlerine göre çalışma saatlerini belirleyin
   - Mola saatlerini tanımlayın (varsa)

### 3. **E-posta Şablonlarını Özelleştirme**
   - `services/email.ts` dosyasındaki HTML şablonları düzenleyin
   - Markalamanızı yansıtacak şekilde renkler ve logo ekleyin

### 4. **WhatsApp Entegrasyonu**
   - `services/whatsapp.ts` dosyasını güncelleyin
   - Twilio veya benzer servis kullanarak gerçek SMS/WhatsApp gönderebilirsiniz

## 🔐 Güvenlik

- **JWT Authentication**: Token-based admin erişimi
- **Environment Variables**: Hassas bilgiler .env.local içinde saklanır
- **Password Hashing**: bcrypt ile şifre hashleme
- **CORS**: API güvenliği için CORS politikaları
- **Input Validation**: Tüm girdiler kontrol edilir

## 📞 Admin Test Hesabı

```
Kullanıcı Adı: admin
Şifre: admin123
```

⚠️ **Üretime taşımadan önce şifreyi değiştirin!**

## 🗓️ Zaman Dilimi (Timezone)

Tüm işlemler **İngiltere (London/GMT)** zaman dilimine göre yapılır:
- Randevu saatleri: London zamanında
- E-posta/SMS notifikasyonları: London zamanında
- İstatistikler: London zamanında

`lib/time.ts` dosyasındaki fonksiyonları kullanarak zaman dönüşümleri yapılır.

## 🚀 Deployment

### Vercel'e Deploy (Önerilen)

```bash
npm install -g vercel
vercel login
vercel
```

### Self-Hosted (VPS)

```bash
npm run build
NODE_ENV=production npm start
```

## 📄 Lisans

Bu proje özel bir proje olarak geliştirilmiştir.

## 🤝 Destek

Sorular veya sorunlar için `info@hairsalon.com` adresine iletişime geçiniz.

---

**Hair Salon Pro** - Modern Saç Tasarımı Hizmetleri ✨
