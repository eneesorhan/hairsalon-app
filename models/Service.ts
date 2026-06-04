import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  name: string;
  description: string;
  duration: number; // Dakika cinsinden (60, 90, 120)
  price: number;
  category: 'cutting' | 'coloring' | 'styling' | 'treatment' | 'other';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    name: {
      type: String,
      required: [true, 'Hizmet adı gereklidir'],
      trim: true,
      maxlength: [100, 'Hizmet adı 100 karakterden uzun olamaz'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Açıklama 500 karakterden uzun olamaz'],
    },
    duration: {
      type: Number,
      required: [true, 'Hizmet süresi gereklidir'],
      enum: [30, 45, 60, 90, 120, 150, 180],
    },
    price: {
      type: Number,
      required: [true, 'Fiyat gereklidir'],
      min: [0, 'Fiyat 0 veya daha büyük olmalıdır'],
    },
    category: {
      type: String,
      enum: ['cutting', 'coloring', 'styling', 'treatment', 'other'],
      default: 'other',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'services',
  }
);

export const Service = mongoose.models.Service || mongoose.model<IService>('Service', serviceSchema);
