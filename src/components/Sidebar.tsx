import { useEffect, useState, type ComponentType } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  MessageSquareMore,
  Folder,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Menu,
  X,
  LogOut,
  Coins,
  ShieldCheck,
} from "lucide-react"
import { Link, useLocation, useNavigate } from "@tanstack/react-router"
import { logout, type AuthUser } from "../lib/auth"

type NavigationTab = {
  name: string
  icon: ComponentType<{ className?: string }>
  to: "/" | "/chat" | "/storage" | "/admin"
}

const TABS: NavigationTab[] = [
  { name: "Chat", icon: MessageSquareMore, to: "/chat" },
  { name: "Dashboard", icon: LayoutGrid, to: "/" },
  { name: "Storage", icon: Folder, to: "/storage" },
]

function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null

  const rawUser = localStorage.getItem("authUser")

  if (!rawUser) return null

  try {
    return JSON.parse(rawUser) as AuthUser
  } catch {
    return null
  }
}

function formatCredits(value: number | undefined) {
  return new Intl.NumberFormat("en-MY").format(value ?? 0)
}

function canAccessAdmin(user: AuthUser | null) {
  return user?.role === "admin" || user?.role === "staff"
}

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === "undefined") return false

    const saved = localStorage.getItem("sidebar-collapsed")
    return saved !== null ? JSON.parse(saved) : false
  })

  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => getStoredUser())

  const location = useLocation()
  const navigate = useNavigate()

  const tabs: NavigationTab[] = canAccessAdmin(authUser)
    ? [
        ...TABS,
        { name: "Admin", icon: ShieldCheck, to: "/admin" },
      ]
    : TABS

  useEffect(() => {
    const syncUser = () => {
      setAuthUser(getStoredUser())
    }

    window.addEventListener("auth-change", syncUser)
    window.addEventListener("storage", syncUser)

    return () => {
      window.removeEventListener("auth-change", syncUser)
      window.removeEventListener("storage", syncUser)
    }
  }, [])

  const toggleCollapse = () => {
    const next = !isCollapsed
    setIsCollapsed(next)
    localStorage.setItem("sidebar-collapsed", JSON.stringify(next))
  }

  const handleLogout = async () => {
    await logout()
    setIsMobileOpen(false)
    navigate({ to: "/login", replace: true })
  }

  return (
    <>
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="p-2 bg-white border border-zinc-200 rounded-lg shadow-sm text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
        >
          <Menu className="size-5" />
        </button>
      </div>

      <AnimatePresence>
        {isMobileOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] cursor-pointer"
          />
        ) : null}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? 64 : 240,
          x:
            isMobileOpen ||
            (typeof window !== "undefined" && window.innerWidth >= 1024)
              ? 0
              : -240,
        }}
        className="
          fixed lg:relative inset-y-0 left-0 z-[70]
          flex flex-col h-full
          bg-white/50 backdrop-blur-2xl
          border-r border-white/20 shadow-2xl shadow-zinc-200/50
          transition-colors duration-300
        "
      >
        <div className="h-16 flex items-center px-4 mb-4 relative">
          <button
            type="button"
            onClick={toggleCollapse}
            className={`
              flex items-center w-full p-2 rounded-xl transition-all duration-300 group cursor-pointer
              ${
                isCollapsed
                  ? "justify-center hover:bg-black/5"
                  : "gap-3 px-2 hover:bg-black/5"
              }
            `}
          >
            <div className="relative size-8 flex items-center justify-center shrink-0">
              <AnimatePresence mode="popLayout">
                {isCollapsed ? (
                  <motion.div
                    key="collapsed-morph"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative size-8 flex items-center justify-center"
                  >
                    <div className="absolute inset-0 rounded-lg bg-amber-400 shadow-lg shadow-amber-400/20 flex items-center justify-center transition-all duration-300 group-hover:opacity-0 group-hover:scale-75">
                      <Cpu className="size-4 text-black" />
                    </div>

                    <div className="absolute inset-0 rounded-lg bg-black/5 flex items-center justify-center opacity-0 scale-75 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100">
                      <ChevronRight className="size-5 text-zinc-600" />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="expanded-logo"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="size-8 rounded-lg bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-400/20"
                  >
                    <Cpu className="size-4 text-black" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {isCollapsed ? null : (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="flex flex-1 items-center justify-between overflow-hidden"
              >
                <span className="text-[15px] font-bold tracking-tight text-zinc-900 whitespace-nowrap">
                  MONHPC
                </span>

                <ChevronLeft className="size-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
              </motion.div>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden absolute right-4 p-1.5 text-zinc-500 hover:text-zinc-900 cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.to
            const Icon = tab.icon

            return (
              <Link
                key={tab.name}
                to={tab.to}
                onClick={() => setIsMobileOpen(false)}
                className={`
                  relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group cursor-pointer
                  ${
                    isActive
                      ? "bg-amber-400/10 text-zinc-900"
                      : "text-zinc-500 hover:bg-black/5 hover:text-zinc-900"
                  }
                  ${isCollapsed ? "justify-center" : ""}
                `}
              >
                {isActive ? (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute left-[-12px] top-1 bottom-1 w-1 bg-amber-400 rounded-r-full"
                  />
                ) : null}

                <Icon
                  className={`
                    size-[18px] shrink-0 transition-colors
                    ${
                      isActive
                        ? "text-amber-500"
                        : "text-zinc-400 group-hover:text-zinc-600"
                    }
                  `}
                />

                {isCollapsed ? null : (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`
                      text-sm whitespace-nowrap
                      ${isActive ? "font-semibold" : "font-normal"}
                    `}
                  >
                    {tab.name}
                  </motion.span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-white/20 space-y-1">
          {isCollapsed ? (
            <div
              className="flex items-center justify-center px-3 py-2.5 text-zinc-500"
              title={`${formatCredits(authUser?.creditBalance)} credits`}
            >
              <Coins className="size-[18px] text-amber-500" />
            </div>
          ) : (
            <div
              className="flex items-center gap-3 px-3 py-2 text-zinc-500"
              title={`${formatCredits(authUser?.creditBalance)} credits`}
            >
              <Coins className="size-[18px] shrink-0 text-amber-500" />

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  Credits
                </p>
                <p className="text-sm font-bold text-zinc-800">
                  {formatCredits(authUser?.creditBalance)}
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className={`
              flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
              text-zinc-500 hover:bg-red-50 hover:text-red-600
              transition-all duration-200 group cursor-pointer
              ${isCollapsed ? "justify-center" : ""}
            `}
            title="Log out"
          >
            <LogOut className="size-[18px] shrink-0 text-zinc-400 group-hover:text-red-500 transition-colors" />

            {isCollapsed ? null : (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-medium whitespace-nowrap"
              >
                Log out
              </motion.span>
            )}
          </button>
        </div>
      </motion.aside>
    </>
  )
}