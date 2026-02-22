'use client'

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import { useTranslations } from 'next-intl'
import SendIcon from '@mui/icons-material/Send'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'
import { ChatApiResponse, ChatMessage, ChatMessageType } from '@/types/chat'

type ChatPanelProps = {
  data: ChatApiResponse
}

const QUICK_ACTION_KEYS = ['sendProposal', 'makeCall', 'viewHistory'] as const

function getMessageStyle(type: ChatMessageType) {
  switch (type) {
    case 'user_message':
      return {
        align: 'justify-start' as const,
        bubble: 'rounded-bl-lg bg-blue-600 text-white',
        meta: 'text-blue-200/60',
      }
    case 'assistant_message':
      return {
        align: 'justify-end' as const,
        bubble: 'rounded-br-lg bg-[#20273E] text-slate-200',
        meta: 'text-slate-500',
      }
    case 'ai_suggestion':
      return {
        align: 'justify-end' as const,
        bubble:
          'rounded-br-lg border border-cyan-400/30 bg-cyan-400/10 text-cyan-100',
        meta: 'text-cyan-300/70',
      }
    default:
      return {
        align: 'justify-start' as const,
        bubble: 'rounded-bl-md bg-[#20273E] text-slate-200',
        meta: 'text-slate-500',
      }
  }
}

export default function ChatPanel({ data }: ChatPanelProps) {
  const t = useTranslations('chat')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [inputValue, setInputValue] = useState('')

  const messages = data.messages ?? []
  const iaSuggestion = data.iaSuggestion ?? ''

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600/30 text-sm font-medium text-blue-200">
          RL
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-100">
            Atendimento ao Cliente
          </p>
          <p className="truncate text-xs text-slate-400">
            Chat com sugestões da IA
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          {messages.length === 0 && (
            <p className="py-12 text-center text-sm text-slate-500">
              {t('noMessages')}
            </p>
          )}

          <div className="flex flex-col gap-6">
            {messages.map((msg: ChatMessage, idx: number) => {
              const style = getMessageStyle(msg.type as ChatMessageType)
              const key = msg.id ?? `msg-${idx}`

              return (
                <div key={key} className={cn('flex', style.align)}>
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-4 py-3 text-sm',
                      style.bubble,
                    )}
                  >
                    {msg.author && (
                      <p className="mb-0.5 text-xs font-medium opacity-90">
                        {msg.author}
                      </p>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </p>
                    {msg.timestamp && (
                      <p className={cn('mt-1 text-[10px]', style.meta)}>
                        {msg.timestamp}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Quick action buttons - below last message */}
            <div className="flex flex-wrap justify-end gap-2 pt-2">
              {QUICK_ACTION_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-[0_0_12px_rgba(59,130,246,0.4)] transition hover:bg-blue-500"
                >
                  {t(key)}
                </button>
              ))}
            </div>
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* iaSuggestion - Sugestão principal da IA */}
        {iaSuggestion && (
          <div className="border-t border-white/10 px-4 py-3 sm:px-6">
            <div className="mb-2 flex items-center gap-1.5">
              <AutoAwesomeIcon
                className="text-cyan-400"
                style={{ fontSize: 16 }}
              />
              <span className="text-xs font-medium text-cyan-300">
                {t('aiSuggestion')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setInputValue(iaSuggestion)}
              className="w-full rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-left text-sm text-cyan-100 transition hover:border-cyan-400/50 hover:bg-cyan-400/15"
            >
              <p className="whitespace-pre-wrap leading-relaxed">
                {iaSuggestion}
              </p>
            </button>
          </div>
        )}

        {/* Input area (display-only) */}
        <div className="border-t border-white/10 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t('typeMessage')}
              className="h-10 flex-1 rounded-full border border-white/10 bg-white/5 px-4 text-sm text-slate-200 placeholder:text-slate-500 focus:border-white/20 focus:outline-none"
            />
            <button
              type="button"
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition',
                inputValue
                  ? 'bg-blue-600 text-white hover:bg-blue-500'
                  : 'bg-white/5 text-slate-500',
              )}
            >
              <SendIcon style={{ fontSize: 18 }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
