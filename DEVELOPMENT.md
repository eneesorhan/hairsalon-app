# Hair Salon Pro - Geliştirme Rehberi

## 📚 Veritabanı Şeması Detayları

### 1. **Service (Hizmet)**
```typescript
{
  _id: ObjectId
  name: string              // örn: "Saç Kesimi"
  description: string       // Hizmet açıklaması
  duration: number          // Dakika (60, 90, 120)
  price: number             // Fiyat (GBP)
  category: enum            // cutting | coloring | styling | treatment | other
  isActive: boolean         // Aktif/Pasif
  createdAt: Date
  updatedAt: Date
}
```

### 2. **TimeSlot (Zaman Blokları)**
```typescript
{
  _id: ObjectId
  date: string              // YYYY-MM-DD (London TZ)
  startTime: string         // HH:mm
  endTime: string           // HH:mm
  isBooked: boolean         // Dolu mu?
  appointmentId: ObjectId   // Randevu referansı
  isWalkIn: boolean         // Walk-in müşteri mi?
  notes: string             // Notlar
  timestamp: Date           // UTC timestamp
  createdAt: Date
  updatedAt: Date
}

// Index: { date: 1, startTime: 1 } -> Unique
```

### 3. **Appointment (Randevu)**
```typescript
{
  _id: ObjectId
  customerName: string
  customerEmail: string     // Unique
  customerPhone: string
  serviceId: ObjectId       // Service referansı
  date: string              // YYYY-MM-DD
  startTime: string         // HH:mm
  endTime: string           // HH:mm
  status: enum              // pending | confirmed | completed | cancelled
  notes: string
  reminderSent: boolean     // Hatırlatma e-postası gönderildi mi?
  confirmationEmailSent: boolean
  whatsappLinkGenerated: boolean
  totalPrice: number
  createdAt: Date
  updatedAt: Date
}

// Index: { date: 1, customerEmail: 1 }
```

### 4. **BusinessHours (İşletme Saatleri)**
```typescript
{
  _id: ObjectId
  dayOfWeek: number         // 0=Pazar, 1=Pazartesi, ..., 6=Cumartesi
  dayName: string
  openTime: string          // HH:mm
  closeTime: string         // HH:mm
  isOpen: boolean
  breakStart: string        // HH:mm (isteğe bağlı)
  breakEnd: string          // HH:mm (isteğe bağlı)
  createdAt: Date
  updatedAt: Date
}

// Index: { dayOfWeek: 1 } -> Unique
```

### 5. **AdminUser (Admin Kullanıcı)**
```typescript
{
  _id: ObjectId
  username: string          // Unique
  email: string             // Unique
  passwordHash: string      // Bcrypt hash
  role: enum                // admin | manager
  isActive: boolean
  lastLogin: Date
  createdAt: Date
  updatedAt: Date
}
```

### 6. **Notification (Bildirim Logları)**
```typescript
{
  _id: ObjectId
  appointmentId: ObjectId
  type: enum                // email | whatsapp | sms
  recipient: string         // Email veya telefon
  subject: string           // Email başlığı
  messageContent: string
  status: enum              // pending | sent | failed
  sentAt: Date
  errorMessage: string
  retryCount: number
  createdAt: Date
  updatedAt: Date
}

// Index: { appointmentId: 1, status: 1 }
```

### 7. **ServiceGallery (Fotoğraf Galerisi)**
```typescript
{
  _id: ObjectId
  serviceId: ObjectId       // Service referansı
  title: string
  imageUrl: string
  description: string
  displayOrder: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

---

## 🔄 İş Akışları

### Müşteri Randevu Akışı

```
1. Anasayfa → "Randevu Al" butonuna tıkla
   ↓
2. Hizmet Seçimi (Step 1)
   - Müsait hizmetleri göster
   - Hizmet detaylarını (fiyat, süre) göster
   ↓
3. Tarih ve Saat Seçimi (Step 2)
   - getAvailableSlots() fonksiyonunu çağır
   - TimeSlot tablosundan boş saatleri getir
   - 1 saatlik blokları göster
   ↓
4. Müşteri Bilgisi (Step 3)
   - Ad, e-posta, telefon, notlar
   ↓
5. Randevu Oluştur (Step 4)
   - POST /api/appointments
   - Appointment kaydı oluştur
   - TimeSlot'u dolu işaretle
   - E-posta gönder
   - Onay mesajı göster
```

### Admin Walk-In Ekle Akışı

```
1. Admin Dashboard → Randevular
   ↓
2. "Walk-In Ekle" butonu
   ↓
3. Tarih ve Saat Seç
   - bookTimeSlot() çağır
   - isWalkIn = true olarak işaretle
   ↓
4. Sistem otomatik olarak:
   - TimeSlot kaydını oluştur
   - Randevu oluşturmaz (sadece slot)
   - Admin görüntüsünde göster
```

---

## 🛠️ Önemli Fonksiyonlar

### lib/time.ts
- `getLondonTime()` - London zamanını al
- `getTodayInLondon()` - Bugünü al (YYYY-MM-DD)
- `getDateInDays(days)` - N gün sonrasını al
- `calculateEndTime(startTime, duration)` - Bitiş saatini hesapla
- `isTimeInFuture(date, time)` - Geçmiş mi kontrol et

### lib/timeslot-service.ts
- `getAvailableSlots(date, serviceDuration)` - Boş saatleri getir
- `bookTimeSlot(date, startTime, appointmentId, isWalkIn, notes)` - Saati dolu işaretle
- `releaseTimeSlot(date, startTime)` - Saati boşalt
- `generateTimeSlotsSeed(fromDate, toDate)` - Toplu slot oluştur
- `getAppointmentStats(fromDate, toDate)` - İstatistik al

### services/email.ts
- `sendEmail(options)` - E-posta gönder
- `sendAppointmentConfirmation()` - Onay maili
- `sendAppointmentReminder()` - Hatırlatma maili

### services/whatsapp.ts
- `generateWhatsAppLink(phone, message)` - wa.me linki oluştur
- `createAppointmentWhatsAppLink()` - Randevu için link yarat
- `formatPhoneNumber(phone)` - UK telefon normalizasyonu

---

## 📦 Setup Adımları

1. **Bağımlılıkları Yükle**
   ```bash
   npm install
   ```

2. **Environment Değişkenlerini Ayarla**
   ```bash
   cp .env.local.example .env.local
   # .env.local dosyasını düzenle
   ```

3. **Veritabanını Seed Yap**
   ```bash
   node scripts/seed.js
   ```

4. **Development Sunucusunu Başlat**
   ```bash
   npm run dev
   ```

5. **Test Edin**
   - `http://localhost:3000` - Müşteri tarafı
   - `http://localhost:3000/admin/login` - Admin (admin/admin123)

---

## 🔧 Yapılandırma

### MongoDB Bağlantısı
`.env.local` dosyasında:
```env
MONGODB_URI=mongodb://localhost:27017/hairsalon
```

### Email Konfigürasyonu (Gmail)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # Gmail App Password
SMTP_FROM_EMAIL=noreply@hairsalon.com
SMTP_FROM_NAME=Hair Salon Pro
```

### Timezone
Tüm sistem London/GMT'ye göre yapılandırılıdır. Başka timezone kullanmak için:
- `NEXT_PUBLIC_TIMEZONE` env variable'ını değiştir
- `lib/time.ts` dosyasındaki `LONDON_TZ` sabitini güncelle

---

## 🧪 Test Senaryoları

### Müşteri Tarafı Test
1. ✅ Anasayfayı açabilsin
2. ✅ Hizmet seçebilsin
3. ✅ Mevcut saatleri görebilsin
4. ✅ Randevu oluşturabilsin
5. ✅ Onay e-postası alabilsin

### Admin Tarafı Test
1. ✅ Login yapabilsin
2. ✅ Dashboard'u görebilsin
3. ✅ Randevuları listeleyebilsin
4. ✅ Walk-in ekleyebilsin
5. ✅ İstatistikleri görebilsin

---

## 🚀 Sonraki Adımlar

### Phase 2 (İleride)
- [ ] Müşteri portalı (randevuyu yönet, iptal et)
- [ ] Mobil uygulama (React Native)
- [ ] SMS bildirimleri (Twilio)
- [ ] Çoklu dil desteği
- [ ] Ödeme entegrasyonu (Stripe)
- [ ] Social media entegrasyonu

### Production Ready
- [ ] HTTPS/SSL sertifikası
- [ ] Database backups
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] Load testing

