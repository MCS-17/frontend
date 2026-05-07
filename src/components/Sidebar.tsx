import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  MessageSquareMore,
  Database,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Menu,
  X
} from "lucide-react"
import { Link, useLocation } from "@tanstack/react-router"

const TABS = [
  { name: "Chat", icon: MessageSquareMore, to: "/chat" },
  { name: "Dashboard", icon: LayoutGrid, to: "/" },
  { name: "Storage", icon: Database, to: "/storage" },
]

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const location = useLocation()

  // Load persistence from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed")
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved))
    }
  }, [])

  const toggleCollapse = () => {
    const next = !isCollapsed
    setIsCollapsed(next)
    localStorage.setItem("sidebar-collapsed", JSON.stringify(next))
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl shadow-sm text-gray-600 hover:text-black transition-colors"
        >
          <Menu className="size-6" />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Content */}
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? 64 : 240,
          x: isMobileOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 1024 ? -240 : 0)
        }}
        className={`
          fixed lg:relative inset-y-0 left-0 z-[70]
          flex flex-col h-full
          bg-white/60 backdrop-blur-3xl
          border-r border-gray-200/50 shadow-2xl shadow-gray-200/50
          transition-colors duration-300
        `}
      >
        {/* Unified Logo/Toggle Section */}
        <div className="h-16 flex items-center px-3 mb-2 relative">
          <button
            onClick={toggleCollapse}
            className={`
              flex items-center w-full p-1.5 rounded-xl transition-all duration-300 group
              ${isCollapsed ? "justify-center hover:bg-black/5" : "gap-2.5 px-2 hover:bg-black/5"}
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
                    {/* Logo - visible by default, fades on hover */}
                    <div className="absolute inset-0 rounded-lg bg-amber-400 shadow-lg shadow-amber-400/20 flex items-center justify-center transition-all duration-300 group-hover:opacity-0 group-hover:scale-75">
                      <Cpu className="size-4 text-black" />
                    </div>
                    {/* Chevron - hidden by default, appears on hover */}
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

            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="flex flex-1 items-center justify-between overflow-hidden"
              >
                <span className="text-lg font-bold tracking-tight text-zinc-900 whitespace-nowrap">
                  MONHPC
                </span>
                <ChevronLeft className="size-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
              </motion.div>
            )}
          </button>

          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden absolute right-4 p-1.5 text-zinc-500 hover:text-black"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 px-3 space-y-1">
          {TABS.map((tab) => {
            const isActive = location.pathname === tab.to
            return (
              <Link
                key={tab.name}
                to={tab.to}
                className={`
                  flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl transition-all duration-200 group
                  ${isActive
                    ? "bg-amber-400 text-black shadow-sm"
                    : "text-zinc-500 hover:bg-black/5 hover:text-zinc-900"
                  }
                `}
              >
                <tab.icon className={`size-5 shrink-0 ${isActive ? "text-black" : "group-hover:scale-105 transition-transform"}`} />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm font-semibold whitespace-nowrap"
                  >
                    {tab.name}
                  </motion.span>
                )}
              </Link>
            )
          })}
        </nav>
      </motion.aside>
    </>
  )
}
