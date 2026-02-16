export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface UserEntity {
  uid: string
  name: string
  email: string
  role?: UserRole
  createdAt?: Date
  updatedAt?: Date
}