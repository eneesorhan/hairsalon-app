import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'manager';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const adminUserSchema = new Schema<IAdminUser>(
  {
    username: {
      type: String,
      required: [true, 'Kullanıcı adı gereklidir'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'E-posta gereklidir'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Geçerli bir e-posta adresi giriniz',
      ],
    },
    passwordHash: {
      type: String,
      required: [true, 'Şifre gereklidir'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['admin', 'manager'],
      default: 'manager',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: 'admin_users',
  }
);

// Şifre alanı gösterilmeyecek
adminUserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    const r = ret as unknown as Record<string, unknown>;
    delete r['passwordHash'];
    return ret;
  },
});

export const AdminUser = mongoose.models.AdminUser || mongoose.model<IAdminUser>('AdminUser', adminUserSchema);
