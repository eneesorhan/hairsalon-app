import mongoose, { Schema, Document } from 'mongoose';

export interface ITimeSlot extends Document {
  date: string; // YYYY-MM-DD formatında (London timezone)
  startTime: string; // HH:mm formatında (24-saat)
  endTime: string; // HH:mm formatında (24-saat)
  isBooked: boolean;
  appointmentId?: mongoose.Types.ObjectId; // Randevu ID'si (varsa)
  isWalkIn?: boolean; // Walk-in müşteri mi?
  notes?: string;
  timestamp: Date; // UTC'de depolanacak, çevirme için kullanılacak
  createdAt: Date;
  updatedAt: Date;
}

const timeSlotSchema = new Schema<ITimeSlot>(
  {
    date: {
      type: String,
      required: [true, 'Tarih gereklidir (YYYY-MM-DD)'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Tarih YYYY-MM-DD formatında olmalıdır'],
    },
    startTime: {
      type: String,
      required: [true, 'Başlangıç saati gereklidir (HH:mm)'],
      match: [/^\d{2}:\d{2}$/, 'Saat HH:mm formatında olmalıdır'],
    },
    endTime: {
      type: String,
      required: [true, 'Bitiş saati gereklidir (HH:mm)'],
      match: [/^\d{2}:\d{2}$/, 'Saat HH:mm formatında olmalıdır'],
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
    },
    isWalkIn: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'timeslots',
  }
);

// Bileşik index: tarih ve başlangıç saatine göre ünique
timeSlotSchema.index({ date: 1, startTime: 1 }, { unique: true });

export const TimeSlot = mongoose.models.TimeSlot || mongoose.model<ITimeSlot>('TimeSlot', timeSlotSchema);
