interface NotificationUserInput {
  userId: string
  tokens: string[]
}

interface CreateNotificationInput {
  users: NotificationUserInput[]
  title: string
  content: string
  date: Date | null
  type: string
  status: string
  hasSeen: boolean
  createdAt: Date
}

export const createNotificationDoc = async (
  payload: CreateNotificationInput,
) => {
  if (!payload.title || !payload.content) {
    return { error: 'Dados da notificacao invalidos' }
  }

  return { error: null }
}
