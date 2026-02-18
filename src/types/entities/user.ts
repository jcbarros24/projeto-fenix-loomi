export const UserRole = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export interface UserEntity {
  uid: string
  email: string
  name: string
  role: UserRole
  createdAt: Date | string
  updatedAt: Date | string
}
