import { Expo, ExpoPushMessage } from 'expo-server-sdk'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { createNotificationDoc } from '@/services/notification/notification'

const expo = new Expo({
  useFcmV1: true,
  accessToken: process.env.EXPO_ACCESS_TOKEN,
})

const bodySchema = z.object({
  users: z.array(
    z.object({
      userId: z.string(),
      tokens: z.string().array(),
    }),
  ),
  title: z.string(),
  content: z.string(),
  date: z.date().nullable(),
  type: z.enum(['type1', 'type2']),
  status: z.string().default(''),
  hasSeen: z.boolean().default(false),
})

export async function POST(request: Request) {
  const body = await request.json()

  const { users, title, content, date, type, status } = bodySchema.parse(body)

  const messages: ExpoPushMessage[] = []

  for (const { tokens } of users) {
    for (const token of tokens) {
      if (!Expo.isExpoPushToken(token)) {
        console.error(`Push token ${token} is not a valid Expo push token`)
        continue
      }

      messages.push({
        to: token,
        body: content,
        title,
        priority: 'high',
        data: { type },
      })
    }
  }

  const chunks = expo.chunkPushNotifications(messages)

  for (const chunk of chunks) {
    await expo.sendPushNotificationsAsync(chunk)
  }

  await createNotificationDoc({
    content,
    users,
    title,
    date,
    createdAt: new Date(),
    type,
    hasSeen: false,
    status,
  })

  return NextResponse.json(
    {
      success: true,
    },
    {
      status: 200,
    },
  )
}
