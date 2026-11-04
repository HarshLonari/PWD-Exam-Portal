import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: 'admin' | 'employee';
  resetToken?: string;
  resetTokenHash?: string;
  resetTokenExpiry?: Date;
  refreshToken?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
    resetToken: { type: String },
    resetTokenHash: { type: String, select: false },
    resetTokenExpiry: { type: Date },
    refreshToken: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
