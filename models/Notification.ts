import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  appointmentId: mongoose.Types.ObjectId;
  type: 'email' | 'whatsapp' | 'sms';
  recipient: string;
  subject?: string;
  messageContent: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: Date;
  errorMessage?: string;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'Randevu ID gereklidir'],
    },
    type: {
      type: String,
      enum: ['email', 'whatsapp', 'sms'],
      required: true,
    },
    recipient: {
      type: String,
      required: [true, 'Alıcı bilgisi gereklidir'],
    },
    subject: {
      type: String,
      trim: true,
    },
    messageContent: {
      type: String,
      required: [true, 'Mesaj içeriği gereklidir'],
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
    },
    sentAt: {
      type: Date,
    },
    errorMessage: {
      type: String,
      trim: true,
    },
    retryCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    collection: 'notifications',
  }
);

// Index: randevu ID ve status
notificationSchema.index({ appointmentId: 1, status: 1 });

export const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema);
