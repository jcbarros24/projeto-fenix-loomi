import { UserEntity, UserRole } from '@/types/entities/user'

type UserStore = Record<string, UserEntity>

const now = new Date()

const mockUsers: UserStore = {
  'mock-admin': {
    uid: 'mock-admin',
    email: 'admin@example.com',
    name: 'Administrador',
    role: UserRole.ADMIN,
    createdAt: now,
    updatedAt: now,
  },
}

const ensureUser = (uid: string): UserEntity => {
  if (!mockUsers[uid]) {
    mockUsers[uid] = {
      uid,
      email: `${uid}@example.com`,
      name: 'Usuario',
      role: UserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  return mockUsers[uid]
}

export const getUserDoc = async (uid: string) => {
  if (!uid) {
    return { user: null, error: 'Usuario nao encontrado' }
  }

  return { user: ensureUser(uid), error: null }
}

export const getAllUsers = async () => {
  return { users: Object.values(mockUsers), error: null }
}

export const createNewUserDoc = async ({
  uid,
  email,
  name,
  role,
}: {
  uid: string
  email: string
  name: string
  role: UserRole
}) => {
  mockUsers[uid] = {
    uid,
    email,
    name,
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  return { user: mockUsers[uid], error: null }
}

export const updateUserDoc = async (
  uid: string,
  updates: Partial<Pick<UserEntity, 'email' | 'name' | 'role'>>,
) => {
  const user = ensureUser(uid)

  mockUsers[uid] = {
    ...user,
    ...updates,
    updatedAt: new Date(),
  }

  return { error: null }
}

export const deleteUserDoc = async (uid: string) => {
  if (!uid) {
    return { error: 'Usuario invalido' }
  }

  delete mockUsers[uid]
  return { error: null }
}
