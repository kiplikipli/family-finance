export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
