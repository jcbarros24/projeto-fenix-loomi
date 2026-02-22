'use client'

import { useTranslations } from 'next-intl'

import ChatPanel from '@/components/organisms/Chat/ChatPanel'
import { useChat } from '@/hooks/queries'
import { ChatApiResponse } from '@/types/chat'

function normalizeChatData(raw: ChatApiResponse): ChatApiResponse {
  const root = (raw as { data?: ChatApiResponse })?.data ?? raw
  return {
    messages: root.messages ?? [],
    iaSuggestion: root.iaSuggestion ?? '',
    conversationAnalysis: root.conversationAnalysis ?? {
      insights: { title: 'Análise da IA', insights: [] },
      futureSteps: { title: 'Próximos passos', actions: [] },
    },
  }
}

function ChatSkeleton({ loadingText }: { loadingText: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-cyan-400" />
        <span className="text-sm text-slate-400">{loadingText}</span>
      </div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <p className="text-sm text-red-400">{message}</p>
    </div>
  )
}

export default function ChatPage() {
  const t = useTranslations('chat')
  const { data, isPending, isError } = useChat()

  if (isPending) {
    return (
      <div className="-mx-4 -mt-6 h-[calc(100vh-64px)] sm:-mx-6">
        <ChatSkeleton loadingText={t('loading')} />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="-mx-4 -mt-6 h-[calc(100vh-64px)] sm:-mx-6">
        <ErrorState message={t('loadError')} />
      </div>
    )
  }

  const normalized = normalizeChatData(data)

  return (
    <div className="-mx-4 -mt-6 h-[calc(100vh-64px)] sm:-mx-6">
      <ChatPanel data={normalized} />
    </div>
  )
}
