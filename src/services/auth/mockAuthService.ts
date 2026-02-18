export interface MockAuthUser {
  uid: string
  email: string
  emailVerified: boolean
}

type AuthStateListener = (user: MockAuthUser | null) => void

interface AuthResult {
  user: MockAuthUser | null
  error: string | null
}

const listeners = new Set<AuthStateListener>()
let currentUser: MockAuthUser | null = null

const notifyListeners = () => {
  listeners.forEach((listener) => listener(currentUser))
}

const buildUser = (email: string): MockAuthUser => {
  const normalized = email.trim().toLowerCase()

  return {
    uid: `mock-${normalized.replace(/[^a-z0-9]/g, '-')}`,
    email: normalized,
    emailVerified: true,
  }
}

export const waitForUser = (listener: AuthStateListener) => {
  listeners.add(listener)
  listener(currentUser)

  return () => {
    listeners.delete(listener)
  }
}

export const signInWithEmailAndPasswordLocal = async (
  email: string,
  password: string,
): Promise<AuthResult> => {
  if (!email || !password) {
    return { user: null, error: 'Credenciais inválidas' }
  }

  currentUser = buildUser(email)
  notifyListeners()

  return { user: currentUser, error: null }
}

export const createUserWithEmailAndPasswordLocal = async (
  email: string,
  password: string,
): Promise<AuthResult> => {
  if (!email || !password) {
    return { user: null, error: 'Dados inválidos para cadastro' }
  }

  currentUser = buildUser(email)
  notifyListeners()

  return { user: currentUser, error: null }
}

export const recoverPassword = async (email: string) => {
  if (!email) {
    return { error: 'Email inválido' }
  }

  return { error: null }
}

export const logout = async () => {
  currentUser = null
  notifyListeners()
}

export const deleteOwnAccount = async () => {
  currentUser = null
  notifyListeners()

  return { error: null }
}
