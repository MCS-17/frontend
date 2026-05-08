import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion } from "motion/react"
import { AlertCircle, ArrowRight, Cpu, Lock, Mail } from "lucide-react"
import { useState, type FormEvent } from "react"
import { ApiError } from "../lib/api"
import { login, register } from "../lib/auth"

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      if (isRegisterMode) {
        await register(email, password)
      }

      await login(email, password)
      navigate({ to: "/chat", replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail)
      } else if (err instanceof TypeError) {
        setError("Cannot reach backend. Make sure FastAPI is running on port 8000.")
      } else {
        setError("Something went wrong. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden bg-transparent">
      {/* Background Blobs (Replicated from root for continuity) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] size-[800px] rounded-full bg-amber-400/60 blur-[250px] opacity-50" />
        <div className="absolute top-[20%] -right-[10%] size-[900px] rounded-full bg-blue-400/40 blur-[300px] opacity-40" />
        <div className="absolute -bottom-[10%] left-[20%] size-[800px] rounded-full bg-purple-400/40 blur-[250px] opacity-30" />
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        {/* Branding Section (Outside the card) */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="size-16 rounded-[1.5rem] bg-amber-400 flex items-center justify-center shadow-xl shadow-amber-400/30 mb-6"
          >
            <Cpu className="size-8 text-black" />
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900">MONHPC</h1>
          <p className="text-zinc-500 mt-2 font-semibold tracking-wide uppercase text-xs">Student HPC Portal</p>
        </div>

        <div className="bg-white/50 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 p-10 relative overflow-hidden">
          {error ? (
            <div className="mb-5 flex gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              <AlertCircle className="size-5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-400 transition-colors group-focus-within:text-amber-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  autoComplete="email"
                  className="w-full h-14 pl-12 pr-4 bg-white/50 border border-zinc-200 rounded-2xl outline-none focus:border-amber-400 transition-all font-medium placeholder:text-zinc-400 text-black"
                  required
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-400 transition-colors group-focus-within:text-amber-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete={isRegisterMode ? "new-password" : "current-password"}
                  minLength={6}
                  className="w-full h-14 pl-12 pr-4 bg-white/50 border border-zinc-200 rounded-2xl outline-none focus:border-amber-400 transition-all font-medium placeholder:text-zinc-400 text-black"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-zinc-900 hover:bg-black text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isRegisterMode ? "Create Account" : "Sign In"}
                  <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode((current) => !current)
              setError("")
            }}
            className="mt-6 w-full text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            {isRegisterMode
              ? "Already have an account? Sign in"
              : "No account yet? Create one"}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
