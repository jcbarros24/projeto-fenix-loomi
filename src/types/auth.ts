export enum UserState {
  CONFIRMED = 'CONFIRMED',
  PENDING_CONFIRMATION = 'PENDING_CONFIRMATION',
}
export interface User {
  id: string
  name: string
  email: string
  state: UserState
}

export interface LoginResponse {
  access_token: string
  user: User
}
