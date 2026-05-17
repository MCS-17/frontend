import { apiRequest } from './api'

const BASE_API_URI = '/api/ai'

export interface DialogueFile {
  name: string
  path: string
}

export interface Dialogue {
  _id: string
  conversation_id: string
  content: string
  sent_by: 'user' | 'ai'
  timestamp: string
  files?: DialogueFile[]
  is_safe: boolean
}

export interface Conversation {
  _id: string
  title: string
}

export interface ChatResponse {
  final_response: string | null
  is_safe: boolean
  requires_clarification: boolean
  execution_data: Record<string, unknown> | null
  safety_hazard: string | null
  convo_id?: string // only on create
}

export interface ConversationDetail {
  conversation: Conversation
  dialogues: Dialogue[]
}

export interface ContextStatus {
  max_tokens: number
  total_tokens: number
  percentage: number
}

export const chatApi = {
  listConversations: () =>
    apiRequest<Conversation[]>(`${BASE_API_URI}/convo`),

  getConversation: (convoId: string) =>
    apiRequest<ConversationDetail>(`${BASE_API_URI}/convo/${convoId}`),

  createConversation: (message: string, files: File[] = []) => {
    const form = new FormData()
    form.append('message', message)
    files.forEach(f => form.append('files', f))
    return apiRequest<ChatResponse>(`${BASE_API_URI}/convo`, { method: 'POST', body: form })
  },

  continueConversation: (convoId: string, message: string, files: File[] = []) => {
    const form = new FormData()
    form.append('message', message)
    files.forEach(f => form.append('files', f))
    return apiRequest<ChatResponse>(`${BASE_API_URI}/convo/${convoId}`, { method: 'POST', body: form })
  },

  deleteConversation: (convoId: string) =>
    apiRequest<{ message: string }>(`${BASE_API_URI}/convo/${convoId}`, { method: 'DELETE' }),

  getContextStatus: (convoId: string) =>
    apiRequest<ContextStatus>(`${BASE_API_URI}/convo/${convoId}/context`),
}