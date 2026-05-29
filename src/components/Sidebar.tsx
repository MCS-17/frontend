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
  MessageSquare,
  Trash2,
  SendHorizontal,
  Server
} from "lucide-react"
import { Link, useLocation, useNavigate, useParams } from "@tanstack/react-router"
import { useQuery, useQueryClient, useMutation, useMutationState } from "@tanstack/react-query"
import { logout, type AuthUser } from "../lib/auth"
import { chatApi, type Conversation } from "../lib/chat"

type NavigationTab = {
  name: string
  icon: ComponentType<{ className?: string }>
  to: "/" | "/chat" | "/storage" | "/admin" | "/submit" | "/nodes"
}

const TOP_TABS: NavigationTab[] = [
  { name: "Chat", icon: MessageSquareMore, to: "/chat" },
  { name: "Submit", icon: SendHorizontal, to: "/submit" },
  { name: "Dashboard", icon: LayoutGrid, to: "/" },
  { name: "Nodes", icon: Server, to: "/nodes" },
  { name: "Storage", icon: Folder, to: "/storage" },
]

const BOTTOM_TABS: NavigationTab[] = [
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

// Add this helper above ConversationList
function SidebarTypingIndicator() {
  return (
    <div className="flex gap-1 items-center ml-2 h-4">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="size-1 rounded-full bg-amber-500"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  )
}

function ConversationList({
  isCollapsed,
  currentConvoId,
  onNavigate,
}: {
  isCollapsed: boolean
  currentConvoId?: string
  onNavigate: () => void
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  // Gather all parallel background creation streams
  const pendingCreations = useMutationState({
    filters: { mutationKey: ["createConversation"], status: "pending" },
  })

  const { data, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => chatApi.listConversations(),
    staleTime: 0, // always consider stale
    refetchOnWindowFocus: true,
  })

  const deleteMutation = useMutation({
    mutationFn: (convoId: string) => chatApi.deleteConversation(convoId),
    onSuccess: (_data, convoId) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] })
      if (currentConvoId === convoId) {
        navigate({ to: "/chat" })
      }
    },
  })

  const conversations = data ?? []

  if (isCollapsed) {
    return (
      <div className="px-3 py-1">
        <div className="w-full h-px bg-white/30 mb-2" />

        {/* Render indicator pills for active creations in miniature layout */}
        {pendingCreations.map((m: any) => {
          const pendingId = m.variables?.pendingId
          if (!pendingId) return null
          return (
            <Link
              key={pendingId}
              to="/chat/$convoId"
              params={{ convoId: pendingId }}
              onClick={onNavigate}
              className="flex items-center justify-center px-3 py-2.5 rounded-xl mb-0.5 bg-amber-400/10 text-amber-500 animate-pulse"
              title="Starting chat..."
            >
              <MessageSquare className="size-[16px] shrink-0 text-amber-500" />
            </Link>
          )
        })}

        {isLoading ? (
          <div className="flex justify-center py-2">
            <div className="size-1.5 rounded-full bg-zinc-300 animate-pulse" />
          </div>
        ) : (
          conversations.slice(0, 8).map((convo) => {
            const isActive = currentConvoId === convo._id
            return (
              <Link
                key={convo._id}
                to="/chat/$convoId"
                params={{ convoId: convo._id }}
                onClick={onNavigate}
                title={convo.title}
                className={`
                  flex items-center justify-center px-3 py-2.5 rounded-xl mb-0.5 transition-all duration-200
                  ${isActive
                    ? "bg-amber-400/10 text-amber-500"
                    : "text-zinc-400 hover:bg-black/5 hover:text-zinc-600"
                  }
                `}
              >
                <MessageSquare className="size-[16px] shrink-0" />
              </Link>
            )
          })
        )}
      </div>
    )
  }

  return (
    <div className="px-3 flex flex-col min-h-0">
      {/* Divider + label */}
      <div className="flex items-center gap-2 px-1 mb-1.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 whitespace-nowrap">
          Recent Chats
        </span>
        <div className="flex-1 h-px bg-zinc-200/60" />
      </div>

      {/* Scrollable list */}
      <div className="overflow-y-auto flex-1 space-y-0.5 pr-0.5 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
        {isLoading && (
          <div className="space-y-1.5 py-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 rounded-xl bg-zinc-100 animate-pulse" />
            ))}
          </div>
        )}
        {!isLoading && conversations.length === 0 && (
          <p className="text-xs text-zinc-400 px-3 py-2 italic">No conversations yet</p>
        )}

        <AnimatePresence initial={false}>
          {/* render every active pending session */}
          {pendingCreations.map((m: any) => {
            const vars = m.variables
            const pendingId = vars?.pendingId
            if (!pendingId) return null
            const isActive = currentConvoId === pendingId

            return (
              <motion.div
                key={pendingId}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="relative group"
              >
                <Link
                  to="/chat/$convoId"
                  params={{ convoId: pendingId }}
                  onClick={onNavigate}
                  className={`
                    relative flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 w-full bg-amber-400/5 text-zinc-600
                    ${isActive ? "bg-amber-400/10 text-zinc-900" : "hover:bg-black/5 hover:text-zinc-900"}
                  `}
                >
                  {isActive && (
                    <div className="absolute left-[-12px] top-1.5 bottom-1.5 w-1 bg-amber-400 rounded-r-full" />
                  )}
                  <MessageSquare className="size-[15px] shrink-0 text-amber-500 animate-pulse" />
                  <span className="text-xs truncate italic flex items-center gap-1.5 pr-5">
                    Starting chat
                    <span className="flex gap-0.5 items-center">
                      <span className="size-1 rounded-full bg-zinc-400 animate-bounce [animation-delay:0ms]" />
                      <span className="size-1 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]" />
                      <span className="size-1 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]" />
                    </span>
                  </span>
                </Link>
              </motion.div>
            )
          })}

          {conversations.map((convo) => {
            const isActive = currentConvoId === convo._id
            const isHovered = hoveredId === convo._id

            return (
              <motion.div
                key={convo._id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="relative group"
                onMouseEnter={() => setHoveredId(convo._id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <Link
                  to="/chat/$convoId"
                  params={{ convoId: convo._id }}
                  onClick={onNavigate}
                  className={`
                    relative flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 w-full
                    ${isActive
                      ? "bg-amber-400/10 text-zinc-900"
                      : "text-zinc-500 hover:bg-black/5 hover:text-zinc-900"
                    }
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="convo-active-indicator"
                      className="absolute left-[-12px] top-1.5 bottom-1.5 w-1 bg-amber-400 rounded-r-full"
                    />
                  )}
                  <MessageSquare
                    className={`size-[15px] shrink-0 ${isActive ? "text-amber-500" : "text-zinc-400 group-hover:text-zinc-500"}`}
                  />
                  <span className={`text-xs truncate ${isActive ? "font-semibold" : "font-normal"} pr-5`}>
                    {convo.title}
                  </span>
                </Link>

                {/* Delete button — appears on hover */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.1 }}
                      onClick={(e) => {
                        e.preventDefault()
                        deleteMutation.mutate(convo._id)
                      }}
                      disabled={deleteMutation.isPending}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete conversation"
                    >
                      <Trash2 className="size-3.5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === "undefined") return false
    const saved = localStorage.getItem("sidebar-collapsed")
    return saved !== null ? JSON.parse(saved) : false
  })

  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => getStoredUser())

  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  )

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const location = useLocation()
  const navigate = useNavigate()

  // Extract convoId from current path if on a conversation page
  const convoIdMatch = location.pathname.match(/^\/chat\/([^/]+)$/)
  const currentConvoId = convoIdMatch?.[1]

  const topTabs: NavigationTab[] = canAccessAdmin(authUser)
    ? [...TOP_TABS, { name: "Admin", icon: ShieldCheck, to: "/admin" }]
    : TOP_TABS

  useEffect(() => {
    const syncUser = () => setAuthUser(getStoredUser())
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

  const renderNavTab = (tab: NavigationTab) => {
    const isActive = location.pathname === tab.to
    const Icon = tab.icon
    return (
      <Link
        key={tab.name}
        to={tab.to}
        onClick={() => setIsMobileOpen(false)}
        className={`
          relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group cursor-pointer
          ${isActive ? "bg-amber-400/10 text-zinc-900" : "text-zinc-500 hover:bg-black/5 hover:text-zinc-900"}
          ${isCollapsed ? "justify-center" : ""}
        `}
      >
        {isActive && (
          <motion.div
            layoutId="active-indicator"
            className="absolute left-[-12px] top-1 bottom-1 w-1 bg-amber-400 rounded-r-full"
          />
        )}
        <Icon
          className={`size-[18px] shrink-0 transition-colors ${isActive ? "text-amber-500" : "text-zinc-400 group-hover:text-zinc-600"
            }`}
        />
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-sm whitespace-nowrap ${isActive ? "font-semibold" : "font-normal"}`}
          >
            {tab.name}
          </motion.span>
        )}
      </Link>
    )
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
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] cursor-pointer"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? 64 : 240,
          x: isMobileOpen || isDesktop ? 0 : -240,
        }}
        className="
          fixed lg:relative inset-y-0 left-0 z-[70]
          flex flex-col h-full
          bg-white/50 backdrop-blur-2xl
          border-r border-white/20 shadow-2xl shadow-zinc-200/50
          transition-colors duration-300
        "
      >
        {/* Logo / collapse toggle */}
        <div className="h-16 flex items-center px-4 mb-2 relative">
          <button
            type="button"
            onClick={toggleCollapse}
            className={`
              flex items-center w-full p-2 rounded-xl transition-all duration-300 group cursor-pointer
              ${isCollapsed ? "justify-center hover:bg-black/5" : "gap-3 px-2 hover:bg-black/5"}
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

            {!isCollapsed && (
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

        {/* Top nav: Chat, Dashboard, (Admin) */}
        <nav className="px-3 space-y-1 mb-2">
          {topTabs.map(renderNavTab)}
        </nav>

        {/* Conversation list — only shown when not collapsed, grows to fill space */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ConversationList
            isCollapsed={isCollapsed}
            currentConvoId={currentConvoId ?? undefined}
            onNavigate={() => setIsMobileOpen(false)}
          />
        </div>

        {/* Divider before Storage */}
        <div className="px-4 py-1">
          <div className="h-px bg-zinc-200/60" />
        </div>

        {/* Bottom nav: Storage */}
        <nav className="px-3 space-y-1 mb-1">
          {BOTTOM_TABS.map(renderNavTab)}
        </nav>

        {/* Credits + logout */}
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
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Credits</p>
                <p className="text-sm font-bold text-zinc-800">{formatCredits(authUser?.creditBalance)}</p>
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
            {!isCollapsed && (
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