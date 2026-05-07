import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion } from "motion/react"
import { Cpu, Lock, User, ArrowRight } from "lucide-react"
import { useState } from "react"

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Mocking a seamless transition
    setTimeout(() => {
      localStorage.setItem("isAuthenticated", "true")
      // Dispatch a storage event so __root can listen if needed, 
      // but TanStack Router's navigation usually suffices for SPA state
      window.dispatchEvent(new Event('storage')) 
      navigate({ to: "/chat" })
    }, 800)
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

        <div className="bg-white/60 backdrop-blur-3xl border border-gray-200/50 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 p-10 relative overflow-hidden">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-400 transition-colors group-focus-within:text-amber-500" />
                <input 
                  type="text" 
                  placeholder="Username"
                  className="w-full h-14 pl-12 pr-4 bg-white/50 border border-zinc-200 rounded-2xl outline-none focus:border-amber-400 transition-all font-medium placeholder:text-zinc-400 text-black"
                  required
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-400 transition-colors group-focus-within:text-amber-500" />
                <input 
                  type="password" 
                  placeholder="Password"
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
                  Sign In
                  <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
