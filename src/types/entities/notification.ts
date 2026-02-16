export interface NotificationEntity {
  id: string
  title: string
  content: string
  users: {
    userId: string
    tokens: string[]
  }[]
  createdAt: Date
  date: Date | null
  type: 'type1' | 'type2'
  status: string
  hasSeen: boolean
}
