export interface User {
  id: string
  name: string
  email: string
}

export interface LoginResponse {
  access_token: string
  user: User
}
