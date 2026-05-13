import { createFileRoute } from '@tanstack/react-router'
import {
  AlertCircle,
  CheckCircle2,
  Coins,
  Edit3,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  listAdminUsers,
  updateUserCredits,
  type AdminUser,
  type CreditOperation,
} from '../lib/admin'

export const Route = createFileRoute('/admin')({
  component: AdminPage,
})

function formatCredits(value: number) {
  return new Intl.NumberFormat('en-MY').format(value)
}

function getRoleBadgeStyle(role: string) {
  if (role === 'admin') {
    return 'border-purple-100 bg-purple-50 text-purple-700'
  }

  if (role === 'staff') {
    return 'border-blue-100 bg-blue-50 text-blue-700'
  }

  return 'border-emerald-100 bg-emerald-50 text-emerald-700'
}

function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [operation, setOperation] = useState<CreditOperation>('add')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    if (!query) return users

    return users.filter((user) => {
      return (
        user.email.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
      )
    })
  }, [users, searchQuery])

  const loadUsers = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await listAdminUsers()
      setUsers(response.users)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadUsers()
  }, [])

  const openCreditModal = (user: AdminUser) => {
    setSelectedUser(user)
    setOperation('add')
    setAmount('')
    setReason('')
    setError('')
    setSuccessMessage('')
  }

  const closeCreditModal = () => {
    setSelectedUser(null)
    setAmount('')
    setReason('')
    setError('')
  }

  const handleUpdateCredits = async () => {
    if (!selectedUser) return

    const numericAmount = Number(amount)

    if (!Number.isFinite(numericAmount) || numericAmount < 0) {
      setError('Please enter a valid credit amount')
      return
    }

    setIsSaving(true)
    setError('')
    setSuccessMessage('')

    try {
      const response = await updateUserCredits(
        selectedUser.username,
        operation,
        numericAmount,
        reason,
      )

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.username === response.username
            ? {
                ...user,
                creditBalance: response.newCreditBalance,
              }
            : user,
        ),
      )

      setSuccessMessage(
        `${response.username} credits updated: ${formatCredits(
          response.oldCreditBalance,
        )} → ${formatCredits(response.newCreditBalance)}`,
      )

      closeCreditModal()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update credits')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="box-border h-full overflow-hidden p-6 lg:p-10">
      <div className="mx-auto flex h-full max-w-7xl flex-col gap-6 overflow-hidden">
        <div className="shrink-0">

          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 lg:text-4xl">
            User Credits
          </h1>

          <p className="mt-2 max-w-full text-sm leading-6 text-zinc-500">
            View users and update their credit balances. Credit changes are
            protected by the backend admin role check.
          </p>
        </div>

        {error ? (
          <div className="shrink-0 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            <AlertCircle className="size-5 shrink-0" />
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError('')}
              className="ml-auto text-red-400 hover:text-red-700 cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : null}

        {successMessage ? (
          <div className="shrink-0 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            <CheckCircle2 className="size-5 shrink-0" />
            <span>{successMessage}</span>
            <button
              type="button"
              onClick={() => setSuccessMessage('')}
              className="ml-auto text-emerald-400 hover:text-emerald-700 cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/30 bg-white/60 shadow-xl shadow-slate-200/50 backdrop-blur-2xl">
          <div className="shrink-0 border-b border-slate-100 px-5 py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">
                  Credit Management
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Select a user to add, deduct, or set credits.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search users..."
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white/70 pl-9 pr-3 text-sm font-medium text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-amber-400 sm:w-64"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => void loadUsers()}
                  disabled={isLoading}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-3 text-sm font-bold text-zinc-600 transition-all hover:bg-white hover:text-zinc-900 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw
                    className={`size-4 ${isLoading ? 'animate-spin' : ''}`}
                  />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-zinc-900 text-left text-[11px] font-bold uppercase tracking-widest text-zinc-300">
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Credits</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-sm font-semibold text-zinc-400"
                    >
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-sm font-semibold text-zinc-400"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      className={`border-b border-slate-100 text-sm transition-colors hover:bg-amber-50/50 ${
                        index % 2 === 0 ? 'bg-white/70' : 'bg-slate-50/70'
                      }`}
                    >
                      <td className="whitespace-nowrap px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white">
                            <UserRound className="size-4" />
                          </div>

                          <div>
                            <p className="font-bold text-zinc-800">
                              {user.username}
                            </p>
                            <p className="text-xs font-medium text-zinc-400">
                              {user.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-5 py-3 text-xs font-medium text-zinc-500">
                        {user.email}
                      </td>

                      <td className="whitespace-nowrap px-5 py-3">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${getRoleBadgeStyle(
                            user.role,
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-3 text-xs font-bold capitalize text-zinc-500">
                        {user.status}
                      </td>

                      <td className="whitespace-nowrap px-5 py-3 text-right text-xs font-bold text-amber-700">
                        <span className="inline-flex items-center justify-end gap-1.5 rounded-lg bg-amber-50 px-2 py-1">
                          <Coins className="size-3.5" />
                          {formatCredits(user.creditBalance)}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-3">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => openCreditModal(user)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-zinc-600 transition-all hover:bg-slate-50 hover:text-zinc-900 cursor-pointer"
                          >
                            <Edit3 className="size-3.5" />
                            Edit credits
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex shrink-0 flex-col gap-3 border-t border-slate-100 px-5 py-3 text-xs font-semibold text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
            <span>{filteredUsers.length} users shown</span>
            <span>{users.length} records total</span>
          </div>
        </div>
      </div>

      {selectedUser ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6 backdrop-blur-sm"
          onClick={closeCreditModal}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">
                  Edit credits
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Updating credits for{' '}
                  <span className="font-bold text-zinc-900">
                    {selectedUser.username}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={closeCreditModal}
                className="rounded-xl p-2 text-zinc-400 transition-all hover:bg-slate-100 hover:text-zinc-900 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-600">
                Current balance
              </p>
              <p className="mt-1 text-2xl font-black text-amber-800">
                {formatCredits(selectedUser.creditBalance)}
              </p>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                  Operation
                </label>

                <select
                  value={operation}
                  onChange={(event) =>
                    setOperation(event.target.value as CreditOperation)
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-zinc-700 outline-none focus:border-amber-400"
                >
                  <option value="add">Add credits</option>
                  <option value="deduct">Deduct credits</option>
                  <option value="set">Set exact balance</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                  Amount
                </label>

                <input
                  type="number"
                  min={0}
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="Enter credit amount"
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-zinc-700 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                  Reason
                </label>

                <textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Optional reason for this credit update"
                  rows={3}
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeCreditModal}
                className="rounded-xl px-4 py-2 text-sm font-bold text-zinc-500 transition-all hover:bg-slate-100 hover:text-zinc-900 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void handleUpdateCredits()}
                disabled={isSaving}
                className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-zinc-800 disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}