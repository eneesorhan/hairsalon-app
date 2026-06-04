// Test email script - run with: node scripts/test-email.mjs
import nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// .env.local dosyasını oku
const envPath = resolve(__dirname, '../.env.local');
const envContent = readFileSync(envPath, 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIndex = trimmed.indexOf('=');
  if (eqIndex > -1) {
    env[trimmed.slice(0, eqIndex).trim()] = trimmed.slice(eqIndex + 1).trim();
  }
}

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: parseInt(env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },
});

console.log('📧 SMTP Config:');
console.log(`   Host: ${env.SMTP_HOST}:${env.SMTP_PORT}`);
console.log(`   User: ${env.SMTP_USER}`);
console.log(`   From: ${env.SMTP_FROM_NAME} <${env.SMTP_FROM_EMAIL}>`);
console.log('');
console.log('🔌 Bağlantı test ediliyor...');

try {
  await transporter.verify();
  console.log('✅ SMTP bağlantısı başarılı!\n');

  console.log('📨 Test maili gönderiliyor...');
  const result = await transporter.sendMail({
    from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
    to: env.SMTP_USER,
    subject: '✅ Hair Salon Pro - Test Maili',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #9333ea 0%, #7e22ce 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">✨ Test Maili</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Hair Salon Pro</p>
        </div>
        <div style="background-color: #f9f9f9; padding: 40px; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; color: #333;">SMTP konfigürasyonu çalışıyor! 🎉</p>
          <div style="background-color: white; border-left: 4px solid #9333ea; padding: 20px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 8px 0;"><strong>Sunucu:</strong> ${env.SMTP_HOST}</p>
            <p style="margin: 8px 0;"><strong>Port:</strong> ${env.SMTP_PORT}</p>
            <p style="margin: 8px 0;"><strong>Kullanıcı:</strong> ${env.SMTP_USER}</p>
            <p style="margin: 8px 0;"><strong>Zaman:</strong> ${new Date().toLocaleString('tr-TR')}</p>
          </div>
          <p style="font-size: 12px; color: #999; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px;">
            Hair Salon Pro - Email Test Script
          </p>
        </div>
      </div>
    `,
  });

  console.log(`✅ Mail gönderildi!`);
  console.log(`   Message ID: ${result.messageId}`);
  console.log(`   Alıcı: ${env.SMTP_USER}`);
} catch (error) {
  console.error('❌ HATA:', error.message);
  if (error.code === 'EAUTH') {
    console.error('\n   Gmail App Password yanlış veya süresi dolmuş.');
    console.error('   Yeni oluşturmak için: https://myaccount.google.com/apppasswords');
  }
  process.exit(1);
}
