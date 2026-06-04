import mongoose, { Schema, Document } from 'mongoose';

export interface IServiceGallery extends Document {
  serviceId: mongoose.Types.ObjectId;
  title: string;
  imageUrl: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const serviceGallerySchema = new Schema<IServiceGallery>(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Hizmet ID gereklidir'],
    },
    title: {
      type: String,
      required: [true, 'Başlık gereklidir'],
      trim: true,
      maxlength: [100, 'Başlık 100 karakterden uzun olamaz'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Görsel URL gereklidir'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Açıklama 300 karakterden uzun olamaz'],
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'service_gallery',
  }
);

export const ServiceGallery = mongoose.models.ServiceGallery || mongoose.model<IServiceGallery>('ServiceGallery', serviceGallerySchema);
