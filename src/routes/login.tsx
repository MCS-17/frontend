import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion } from 'motion/react'
import {
  AlertCircle,
  ArrowRight,
  Cpu,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { login, register } from '../lib/auth'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function isMonashEmail(email: string) {
  const cleanEmail = email.trim().toLowerCase()

  return (
    cleanEmail.endsWith('@student.monash.edu') ||
    cleanEmail.endsWith('@monash.edu')
  )
}

function LoginPage() {
  const navigate = useNavigate()

  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [error, setError] = useState('')

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setShowPassword(false)
    setShowConfirmPassword(false)
    setError('')
  }

  const handleToggleMode = () => {
    setIsRegisterMode((current) => !current)
    resetForm()
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')

    const cleanEmail = email.trim().toLowerCase()

    if (!cleanEmail || !password) {
      setError('Email and password are required')
      return
    }

    if (!isMonashEmail(cleanEmail)) {
      setError('Please use a valid Monash email address')
      return
    }

    if (isRegisterMode) {
      if (!confirmPassword) {
        setError('Please confirm your password')
        return
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }
    }

    setIsSubmitting(true)

    try {
      if (isRegisterMode) {
        await register(cleanEmail, password)
      }

      await login(cleanEmail, password)
      navigate({ to: '/', replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden bg-transparent">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] size-[800px] rounded-full bg-amber-400/60 blur-[250px] opacity-50" />
        <div className="absolute top-[20%] -right-[10%] size-[900px] rounded-full bg-blue-400/40 blur-[300px] opacity-40" />
        <div className="absolute -bottom-[10%] left-[20%] size-[800px] rounded-full bg-purple-400/40 blur-[250px] opacity-30" />
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="size-16 rounded-[1.5rem] bg-amber-400 flex items-center justify-center shadow-xl shadow-amber-400/30 mb-6"
          >
            <Cpu className="size-8 text-black" />
          </motion.div>

          <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
            MONHPC
          </h1>

          <p className="text-zinc-500 mt-2 font-semibold tracking-wide uppercase text-xs">
            Student HPC Portal
          </p>
        </div>

        <div className="bg-white/50 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 p-10 relative overflow-hidden">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-zinc-900">
              {isRegisterMode ? 'Create account' : 'Welcome back'}
            </h2>

            <p className="mt-1 text-sm font-medium text-zinc-500">
              {isRegisterMode
                ? 'Register using your Monash email address'
                : 'Sign in using your Monash account'}
            </p>
          </div>

          {error ? (
            <div className="mb-5 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-400 transition-colors group-focus-within:text-amber-500" />

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Monash email"
                  className="w-full h-14 pl-12 pr-4 bg-white/50 border border-zinc-200 rounded-2xl outline-none focus:border-amber-400 transition-all font-medium placeholder:text-zinc-400 text-black"
                  required
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-400 transition-colors group-focus-within:text-amber-500" />

                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password"
                  className="w-full h-14 pl-12 pr-12 bg-white/50 border border-zinc-200 rounded-2xl outline-none focus:border-amber-400 transition-all font-medium placeholder:text-zinc-400 text-black"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </div>

              {isRegisterMode ? (
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-400 transition-colors group-focus-within:text-amber-500" />

                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Confirm password"
                    className="w-full h-14 pl-12 pr-12 bg-white/50 border border-zinc-200 rounded-2xl outline-none focus:border-amber-400 transition-all font-medium placeholder:text-zinc-400 text-black"
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
                    aria-label={
                      showConfirmPassword
                        ? 'Hide confirm password'
                        : 'Show confirm password'
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="size-5" />
                    ) : (
                      <Eye className="size-5" />
                    )}
                  </button>
                </div>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-zinc-900 hover:bg-black text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isRegisterMode ? 'Create account' : 'Sign in'}
                  <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={handleToggleMode}
              className="text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
            >
              {isRegisterMode
                ? 'Already have an account? Sign in'
                : 'Need an account? Create one'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}