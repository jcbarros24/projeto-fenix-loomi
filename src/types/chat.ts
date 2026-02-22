export type ChatMessageType =
  | 'user_message'
  | 'assistant_message'
  | 'ai_suggestion'

export type ChatMessage = {
  id: string
  author: string
  content: string
  timestamp: string
  type: ChatMessageType
}

export type InsightItem = {
  id: string
  type: string
  category: string
}

export type ActionItem = {
  id: string
  action: string
  priority: 'high' | 'medium' | 'low'
}

export type ConversationInsights = {
  title?: string
  insights?: InsightItem[]
}

export type FutureSteps = {
  title?: string
  actions?: ActionItem[]
}

export type ConversationAnalysis = {
  insights?: Partial<ConversationInsights>
  futureSteps?: Partial<FutureSteps>
}

export type ChatApiResponse = {
  messages?: ChatMessage[]
  iaSuggestion?: string
  conversationAnalysis?: ConversationAnalysis
}
