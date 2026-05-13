import { apiRequest } from './api'

export type AdminUser = {
  id: string
  email: string
  username: string
  role: string
  status: string
  creditBalance: number
}

export type ListAdminUsersResponse = {
  success: boolean
  users: AdminUser[]
}

export type CreditOperation = 'set' | 'add' | 'deduct'

export type UpdateCreditsResponse = {
  success: boolean
  username: string
  operation: CreditOperation
  amount: number
  oldCreditBalance: number
  newCreditBalance: number
}

export function listAdminUsers() {
  return apiRequest<ListAdminUsersResponse>('/api/admin/users')
}

export function updateUserCredits(
  username: string,
  operation: CreditOperation,
  amount: number,
  reason?: string,
) {
  return apiRequest<UpdateCreditsResponse>(
    `/api/admin/users/${encodeURIComponent(username)}/credits`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        operation,
        amount,
        reason: reason?.trim() || null,
      }),
    },
  )
}