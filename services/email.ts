import nodemailer from 'nodemailer';
import { Notification } from '@/models/Notification';
import { connectDB } from '@/lib/db';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const FROM_EMAIL = process.env.SMTP_FROM_EMAIL;
const FROM_NAME = process.env.SMTP_FROM_NAME;

// Email transporter oluştur
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * E-posta gönder
 */
export async function sendEmail(options: EmailOptions): Promise<string> {
  try {
    const result = await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      text: options.text || options.html,
      html: options.html,
    });

    console.log('✅ E-posta gönderildi:', result.messageId);
    return result.messageId;
  } catch (error) {
    console.error('❌ E-posta gönderme hatası:', error);
    throw error;
  }
}

/**
 * Randevu onayı maili gönder
 */
export async function sendAppointmentConfirmation(
  appointmentId: string,
  customerEmail: string,
  customerName: string,
  serviceName: string,
  date: string,
  time: string
): Promise<void> {
  await connectDB();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #9333ea 0%, #7e22ce 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">✨ Randevu Onayı</h1>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 40px; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; color: #333;">Merhaba <strong>${customerName}</strong>,</p>
        
        <p style="font-size: 14px; color: #666; line-height: 1.6;">
          Randevunuz başarılı bir şekilde kaydedilmiştir. İşte detaylar:
        </p>
        
        <div style="background-color: white; border-left: 4px solid #9333ea; padding: 20px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 10px 0;"><strong>Hizmet:</strong> ${serviceName}</p>
          <p style="margin: 10px 0;"><strong>Tarih:</strong> ${date}</p>
          <p style="margin: 10px 0;"><strong>Saat:</strong> ${time}</p>
        </div>
        
        <p style="font-size: 14px; color: #666;">
          Randevunuzu iptal etmek veya değiştirmek isterseniz, lütfen en az 24 saat öncesinden bizimle iletişime geçiniz.
        </p>
        
        <p style="font-size: 12px; color: #999; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
          Hair Salon Pro | Modern Saç Tasarımı Hizmetleri
        </p>
      </div>
    </div>
  `;

  try {
    await sendEmail({
      to: customerEmail,
      subject: 'Randevu Onayınız - Hair Salon Pro',
      html,
    });

    // Bildirim logla
    await Notification.create({
      appointmentId,
      type: 'email',
      recipient: customerEmail,
      subject: 'Randevu Onayınız - Hair Salon Pro',
      messageContent: html,
      status: 'sent',
      sentAt: new Date(),
    });
  } catch (error) {
    await Notification.create({
      appointmentId,
      type: 'email',
      recipient: customerEmail,
      subject: 'Randevu Onayınız - Hair Salon Pro',
      messageContent: html,
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
}

/**
 * Admin'e yeni randevu bildirimi gönder
 */
export async function sendAdminNotification(
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  serviceName: string,
  date: string,
  time: string
): Promise<void> {
  const adminEmail = SMTP_USER;
  if (!adminEmail) return;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 22px;">🔔 Yeni Randevu Geldi!</h1>
      </div>
      <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
        <div style="background-color: white; border-left: 4px solid #4f46e5; padding: 20px; border-radius: 4px; margin-bottom: 20px;">
          <p style="margin: 8px 0;"><strong>👤 Müşteri:</strong> ${customerName}</p>
          <p style="margin: 8px 0;"><strong>📧 E-posta:</strong> ${customerEmail}</p>
          <p style="margin: 8px 0;"><strong>📞 Telefon:</strong> ${customerPhone}</p>
          <p style="margin: 8px 0; border-top: 1px solid #eee; padding-top: 8px;"><strong>✂️ Hizmet:</strong> ${serviceName}</p>
          <p style="margin: 8px 0;"><strong>📅 Tarih:</strong> ${date}</p>
          <p style="margin: 8px 0;"><strong>🕐 Saat:</strong> ${time}</p>
        </div>
        <a href="${process.env.NEXT_PUBLIC_API_URL}/admin/appointments"
           style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
          Admin Panelde Gör →
        </a>
      </div>
    </div>
  `;

  await sendEmail({
    to: adminEmail,
    subject: `🔔 Yeni Randevu: ${customerName} - ${date} ${time}`,
    html,
  });
}

/**
 * Randevu hatırlatma maili gönder
 */
export async function sendAppointmentReminder(
  appointmentId: string,
  customerEmail: string,
  customerName: string,
  serviceName: string,
  date: string,
  time: string
): Promise<void> {
  await connectDB();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">⏰ Randevu Hatırlatması</h1>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 40px; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; color: #333;">Merhaba <strong>${customerName}</strong>,</p>
        
        <p style="font-size: 14px; color: #666; line-height: 1.6;">
          Randevunuzun yarın olduğunu hatırlatmak istiyoruz:
        </p>
        
        <div style="background-color: white; border-left: 4px solid #a855f7; padding: 20px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 10px 0;"><strong>Hizmet:</strong> ${serviceName}</p>
          <p style="margin: 10px 0;"><strong>Tarih:</strong> ${date}</p>
          <p style="margin: 10px 0;"><strong>Saat:</strong> ${time}</p>
        </div>
        
        <p style="font-size: 14px; color: #666; text-align: center;">
          <strong>Lütfen 10 dakika erken gelmeyi unutmayın!</strong>
        </p>
      </div>
    </div>
  `;

  try {
    await sendEmail({
      to: customerEmail,
      subject: 'Randevu Hatırlatması - Hair Salon Pro',
      html,
    });

    await Notification.create({
      appointmentId,
      type: 'email',
      recipient: customerEmail,
      subject: 'Randevu Hatırlatması - Hair Salon Pro',
      messageContent: html,
      status: 'sent',
      sentAt: new Date(),
    });
  } catch (error) {
    await Notification.create({
      appointmentId,
      type: 'email',
      recipient: customerEmail,
      subject: 'Randevu Hatırlatması - Hair Salon Pro',
      messageContent: html,
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
