import { UserRole, UserStatus } from '../enums';

export interface IUser {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  refreshToken: string | null;
  lastLoginAt: Date | null;
  emailVerificationToken: string | null;
  emailVerifiedAt: Date | null;
  passwordResetToken: string | null;
  passwordResetExpires: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserPublic {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
}

export interface IUserAuth {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

export interface IUserCreate {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface IUserUpdate {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface IUserLogin {
  email: string;
  password: string;
}