import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD formatında (London timezone)
  startTime: string; // HH:mm formatında
  endTime: string; // HH:mm formatında
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  reminderSent: boolean;
  confirmationEmailSent: boolean;
  whatsappLinkGenerated: boolean;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    customerName: {
      type: String,
      required: [true, 'Müşteri adı gereklidir'],
      trim: true,
      maxlength: [100, 'Ad 100 karakterden uzun olamaz'],
    },
    customerEmail: {
      type: String,
      required: [true, 'E-posta adı gereklidir'],
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Geçerli bir e-posta adresi giriniz',
      ],
    },
    customerPhone: {
      type: String,
      required: [true, 'Telefon numarası gereklidir'],
      match: [/^[+]?[\d\s\-().]{7,20}$/, 'Geçerli bir telefon numarası giriniz'],
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Hizmet seçimi gereklidir'],
    },
    date: {
      type: String,
      required: [true, 'Tarih gereklidir'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Tarih YYYY-MM-DD formatında olmalıdır'],
    },
    startTime: {
      type: String,
      required: [true, 'Başlangıç saati gereklidir'],
      match: [/^\d{2}:\d{2}$/, 'Saat HH:mm formatında olmalıdır'],
    },
    endTime: {
      type: String,
      required: [true, 'Bitiş saati gereklidir'],
      match: [/^\d{2}:\d{2}$/, 'Saat HH:mm formatında olmalıdır'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notlar 500 karakterden uzun olamaz'],
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    confirmationEmailSent: {
      type: Boolean,
      default: false,
    },
    whatsappLinkGenerated: {
      type: Boolean,
      default: false,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, 'Fiyat negatif olamaz'],
    },
  },
  {
    timestamps: true,
    collection: 'appointments',
  }
);

// Index: tarih ve müşteri e-postasına göre arama
appointmentSchema.index({ date: 1, customerEmail: 1 });

export const Appointment = mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', appointmentSchema);
