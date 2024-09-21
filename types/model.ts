import { Document } from 'mongoose';

export interface CBTUserModelType extends Document {
  name: string;
  email: string;
  avatar: string;
  role: string;
  password: string;
  passwordConfirm: string | undefined;
  passwordChangedAt: Date;
  passwordResetToken: String | undefined;
  passwordResetExpires: Date | undefined;
  // Declare the method in the interface
  correctPassword: (inputedPassword: string, userPassword: string) => boolean;
  changedPasswordAfter: (JWTTimestamp: number) => boolean;
  createPasswordResetToken: () => string;
}
