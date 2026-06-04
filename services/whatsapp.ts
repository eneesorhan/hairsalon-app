import { Notification } from '@/models/Notification';
import { connectDB } from '@/lib/db';

/**
 * WhatsApp mesaj linki oluştur (wa.me formatında)
 */
export function generateWhatsAppLink(
  phoneNumber: string,
  message: string
): string {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}

/**
 * Randevu sonrası WhatsApp mesaj linki oluştur
 */
export async function createAppointmentWhatsAppLink(
  appointmentId: string,
  phoneNumber: string,
  customerName: string,
  serviceName: string,
  date: string,
  time: string
): Promise<string> {
  await connectDB();

  const message = `Merhaba ${customerName}!\n\nHair Salon Pro olarak randevunuz için teşekkürler.\n\n📅 Tarih: ${date}\n⏰ Saat: ${time}\n💇 Hizmet: ${serviceName}\n\nHerhangi bir sorunuz varsa, lütfen bizimle iletişime geçiniz.`;

  const whatsappLink = generateWhatsAppLink(phoneNumber, message);

  // Linki logla
  await Notification.create({
    appointmentId,
    type: 'whatsapp',
    recipient: phoneNumber,
    messageContent: message,
    status: 'sent',
    sentAt: new Date(),
  });

  return whatsappLink;
}

/**
 * Belirtilen numaraya WhatsApp mesajı gönder (sadece link oluştur)
 * Gerçek gönderme için Twilio veya benzer servis kullanılabilir
 */
export function formatPhoneNumber(phone: string): string {
  // +44 ile başlayan UK numaralarını düzelt
  let normalized = phone.replace(/\D/g, '');

  if (normalized.startsWith('0')) {
    // 0'dan başlayan UK numarası
    normalized = '44' + normalized.substring(1);
  } else if (!normalized.startsWith('44')) {
    // Başka bir format
    normalized = '44' + normalized;
  }

  return normalized;
}
