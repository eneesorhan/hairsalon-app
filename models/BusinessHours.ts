import mongoose, { Schema, Document } from 'mongoose';

export interface IBusinessHours extends Document {
  dayOfWeek: number; // 0 = Pazar, 1 = Pazartesi, ..., 6 = Cumartesi
  dayName: string;
  openTime: string; // HH:mm formatında
  closeTime: string; // HH:mm formatında
  isOpen: boolean;
  breakStart?: string; // Mola başlangıcı
  breakEnd?: string; // Mola bitişi
  createdAt: Date;
  updatedAt: Date;
}

const businessHoursSchema = new Schema<IBusinessHours>(
  {
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },
    dayName: {
      type: String,
      required: true,
      enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    openTime: {
      type: String,
      required: true,
      match: [/^\d{2}:\d{2}$/, 'Saat HH:mm formatında olmalıdır'],
    },
    closeTime: {
      type: String,
      required: true,
      match: [/^\d{2}:\d{2}$/, 'Saat HH:mm formatında olmalıdır'],
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    breakStart: {
      type: String,
      match: [/^\d{2}:\d{2}$/, 'Saat HH:mm formatında olmalıdır'],
    },
    breakEnd: {
      type: String,
      match: [/^\d{2}:\d{2}$/, 'Saat HH:mm formatında olmalıdır'],
    },
  },
  {
    timestamps: true,
    collection: 'business_hours',
  }
);

// Ünique: Her haftanın günü sadece bir kez olmalı
businessHoursSchema.index({ dayOfWeek: 1 }, { unique: true });

export const BusinessHours = mongoose.models.BusinessHours || mongoose.model<IBusinessHours>('BusinessHours', businessHoursSchema);
