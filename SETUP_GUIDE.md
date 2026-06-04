# 🚀 Hair Salon Pro - Kurulum Rehberi

## ⚠️ Önemli: Aşağıdaki işlemleri **Ana Terminal**'de yapınız (VS Code Terminal değil)

---

## 📋 Adım 1: Node.js ve npm Kurulması

### Linux (Ubuntu/Debian)
```bash
# Sistem paketlerini güncelle
sudo apt-get update
sudo apt-get install -y nodejs npm

# Versiyon kontrol
node --version
npm --version
```

### Linux (CentOS/RHEL)
```bash
sudo yum install -y nodejs npm
```

### macOS
```bash
# Homebrew kullanarak
brew install node
```

### Windows
- https://nodejs.org/ adresinden LTS sürümünü indir ve kur

---

## 📋 Adım 2: Projeyi Klonla ve Dependencies Yükle

```bash
# Proje dizinine git
cd /home/enes/Projeler/hairsalon-app

# Dependencies yükle
npm install

# Kurulum başarılı mı kontrol et
npm --version
node --version
```

---

## 📋 Adım 3: MongoDB Kurulumu ve Başlatılması

### Option A: MongoDB Community Edition (Local - Önerilen Geliştirme için)

**Ubuntu/Debian:**
```bash
# MongoDB repository ekle
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-archive-keyring.gpg
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-archive-keyring.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# MongoDB yükle
sudo apt-get update
sudo apt-get install -y mongodb-org

# MongoDB başlat
sudo systemctl start mongod
sudo systemctl enable mongod

# Status kontrol
sudo systemctl status mongod
```

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Option B: MongoDB Atlas (Cloud - Kolay, Üretim için Uygun)

1. https://www.mongodb.com/cloud/atlas adresine git
2. Hesap oluştur (ücretsiz tier)
3. Cluster oluştur
4. Connection String al
5. `.env.local` dosyasına yapıştır

---

## 📋 Adım 4: Environment Değişkenlerini Ayarla

```bash
# Proje dizininde
cd /home/enes/Projeler/hairsalon-app

# Örnek dosyayı kopyala
cp .env.local.example .env.local

# Dosyayı düzenle (nano veya VS Code ile)
nano .env.local
```

### `.env.local` içeriği (doldur):

```env
# MongoDB (Local)
MONGODB_URI=mongodb://localhost:27017/hairsalon
MONGODB_DB=hairsalon

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
API_SECRET=your-super-secret-key-change-in-production

# Email Configuration (Gmail örneği)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@hairsalon.com
SMTP_FROM_NAME=Hair Salon Pro

# WhatsApp
WHATSAPP_BUSINESS_PHONE=YOUR_PHONE_NUMBER

# Timezone
NEXT_PUBLIC_TIMEZONE=Europe/London

# Admin
ADMIN_PASSWORD_HASH=admin123
```

### 📧 Gmail App Password (E-posta için):
1. https://myaccount.google.com/apppasswords
2. Mail seç → Windows Device seç
3. Generated password'ü kopyala
4. `.env.local` dosyasına `SMTP_PASSWORD` olarak yapıştır

---

## 📋 Adım 5: Veritabanını Seed Yap (Test Verisi Ekle)

```bash
cd /home/enes/Projeler/hairsalon-app

# Seed script'ini çalıştır
node scripts/seed.js

# Çıkış:
# ✅ MongoDB bağlantısı başarılı
# ✅ 5 hizmet eklendi
# ✅ 7 işletme saati eklendi
# ✅ Admin hesabı oluşturuldu
```

---

## 📋 Adım 6: Development Sunucusunu Başlat

```bash
cd /home/enes/Projeler/hairsalon-app
npm run dev
```

**Çıkış örneği:**
```
> hairsalon-app@1.0.0 dev
> next dev

  ▲ Next.js 14.1.0
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 2.5s
```

---

## 🌐 Uygulamaya Erişim

### Müşteri Tarafı
```
👉 http://localhost:3000
```
- Anasayfa → "Randevu Al" butonu
- Hizmet seçin
- Tarih ve saat seçin
- Bilgilerinizi girin
- Onay e-postası alın

### Admin Tarafı
```
👉 http://localhost:3000/admin/login
```

**Test Hesabı:**
- Kullanıcı Adı: `admin`
- Şifre: `admin123`

---

## 🧪 Test Senaryoları

### 1. Müşteri Randevu Alma
- [ ] Anasayfayı açabilsin (http://localhost:3000)
- [ ] "Randevu Al" butonuna tıklasın
- [ ] Bir hizmet seçsin (örn: Saç Kesimi)
- [ ] Tarih seçsin (bugün + min 1 gün)
- [ ] Mevcut saatleri görsün
- [ ] Saat seçsin
- [ ] Bilgiler gir (ad, e-posta, telefon)
- [ ] Randevu oluştur
- [ ] Onay mesajı görsün
- [ ] E-posta alır

### 2. Admin Giriş
- [ ] Admin sayfasını aç (http://localhost:3000/admin/login)
- [ ] admin / admin123 ile giriş yap
- [ ] Dashboard'u görsün
- [ ] İstatistikleri görsün (toplam randevular, en yoğun saat, gelir)

---

## 🐛 Sorun Giderme

### MongoDB bağlantı hatası
```
❌ MongoDB bağlantısı başarısız
```
**Çözüm:**
```bash
# MongoDB running mu kontrol et
sudo systemctl status mongod

# Değilse başlat
sudo systemctl start mongod

# Local MongoDB bağlantısı test et
mongosh
> db.version()  # Versiyon görmek için
> exit
```

### Port 3000 zaten kullanımda
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Çözüm:**
```bash
# Çalışan process'i bul
lsof -i :3000

# Kill et
kill -9 <PID>
```

### Dependencies kurulum hatası
```bash
# Cache temizle ve yeniden kur
rm -rf node_modules package-lock.json
npm install
```

### Environment değişken hatası
```
MONGODB_URI is not defined
```
**Çözüm:**
- `.env.local` dosyasının olup olmadığını kontrol et
- Tüm değişkenleri doldur

---

## 📱 Production Build

Sunucuya dağıtım için:

```bash
# Production build yap
npm run build

# Build kontrol et
npm start
```

---

## 🆘 Yardım Gerekirse

Terminal'de sorun çıkarsa:
1. Tam hata mesajını kopyala
2. Hata loglarını göster
3. Hangi adımda takıldığını söyle

**Komut:** Terminal'de hataları görmek için:
```bash
npm run dev 2>&1 | tee error.log
cat error.log
```

---

**Next Steps:**
1. ✅ Adım 1-6'yı tamamla
2. ✅ http://localhost:3000 aç
3. ✅ Test et
4. ✅ Admin sayfasına git
5. 🚀 Geliştirmeyi başla!
