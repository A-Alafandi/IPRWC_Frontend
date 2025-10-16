export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  zipCode?: string;
  state?: string;
  role: UserRole;
  createdAt?: Date;
}
