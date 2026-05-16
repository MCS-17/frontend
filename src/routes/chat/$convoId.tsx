import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'motion/react'
import {
  FolderPlus, SendHorizontal, X, ArrowLeft,
  FileText, FileImage, FileCode, FileJson, FileArchive, File,
  AlertTriangle, Bot, User,
} from 'lucide-react'
import { useRef, useState, useCallback, useEffect } from 'react'
import { chatApi, type Dialogue } from "@/lib/chat"
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import { useVirtualizer } from '@tanstack/react-virtual'
import { memo, useMemo } from 'react'
import remarkGithubAdmonitionsToDirectives from "remark-github-admonitions-to-directives"
import remarkDirective from 'remark-directive'
import { visit } from 'unist-util-visit'

/*
remarkGithubAdmonitionsToDirectives converts [!NOTE] blockquotes into directive nodes in the remark AST
remarkDirective teaches the parser to understand directive syntax
since directive nodes are not standard html, rehype doesnt know what are these and just drop them

So we need to tell rehype to convert the containerDirective into a div
*/
const remarkDirectiveRenderer = () => (tree: any) => {
  visit(tree, (node) => {
    if (node.type === 'containerDirective') {
      const type = node.name?.toUpperCase()
      const styles: Record<string, string> = {
        note: 'border-blue-400 bg-blue-50 text-blue-800',
        tip: 'border-green-400 bg-green-50 text-green-800',
        warning: 'border-yellow-400 bg-yellow-50 text-yellow-800',
        info: 'border-purple-400 bg-purple-50 text-purple-800',
        danger: 'border-red-400 bg-red-50 text-red-800',
      }
      node.data = {
        hName: 'div',
        hProperties: {
          className: `admonition admonition-${node.name} border-l-4 px-3 py-2 rounded-r-lg text-sm my-2 ${styles[node.name] ?? ''}`,
          'data-type': type,
        },
      }
    }
  })
}

const normalizeLatex = (content: string) =>
  content
    .replace(/(?<!\n)\$\$/g, '\n$$$$')
    .replace(/\$\$(?!\n)/g, '$$$$\n')
    .trim()

export const Route = createFileRoute('/chat/$convoId')({
  component: ConversationPage,
})

const MAX_FILES = 10

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'jpg': case 'jpeg': case 'png': case 'gif': case 'svg': case 'webp':
      return <FileImage className="size-4" />
    case 'txt': case 'md': case 'pdf': case 'doc': case 'docx':
      return <FileText className="size-4" />
    case 'js': case 'ts': case 'tsx': case 'jsx': case 'py': case 'cpp': case 'h': case 'c': case 'go': case 'rs':
      return <FileCode className="size-4" />
    case 'json':
      return <FileJson className="size-4" />
    case 'zip': case 'rar': case '7z': case 'tar': case 'gz':
      return <FileArchive className="size-4" />
    default:
      return <File className="size-4" />
  }
}

const MessageBubble = memo(
  function MessageBubble({ dialogue, animate }: { dialogue: Dialogue; animate?: boolean }) {
    const isUser = dialogue.sent_by === 'user'
    const hasFiles = isUser && dialogue.files && dialogue.files.length > 0
    const content = useMemo(() => normalizeLatex(dialogue.content), [dialogue.content])

    const bubble = (
      <div className={`flex items-end gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`shrink-0 flex items-center justify-center size-8 rounded-full border ${isUser
          ? 'bg-amber-400 border-amber-500 text-black'
          : 'bg-white border-gray-200 text-gray-600'
          }`}>
          {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
        </div>

        <div className={`flex flex-col gap-1.5 max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
          {/* File chips */}
          {hasFiles && (
            <div className="flex flex-wrap gap-1.5 justify-end">
              {dialogue.files!.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-xl text-xs text-amber-800 font-medium"
                >
                  {getFileIcon(f.name)}
                  <span className="max-w-[140px] truncate">{f.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Bubble */}
          <div className={`prose prose-sm max-w-none chat-prose px-4 py-2.5 rounded-2xl text-sm ${isUser
            ? 'bg-amber-400 text-black rounded-br-sm'
            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
            }`}>
            <ReactMarkdown
              remarkPlugins={[remarkGithubAdmonitionsToDirectives, remarkDirective, remarkDirectiveRenderer, remarkMath, remarkGfm]}
              rehypePlugins={[[rehypeKatex, { throwOnError: false }]]}
              components={{
                code({ className, children }) {
                  const match = /language-(\w+)/.exec(className || '')
                  const isBlock = match || String(children).includes('\n')
                  console.log(children, isBlock)
                  return isBlock ? (
                    <SyntaxHighlighter language={match?.[1] ?? 'text'}>
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className}>{children}</code>
                  )
                }
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    )

    if (!animate) return bubble

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {bubble}
      </motion.div>
    )
  }
)

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3">
      <div className="shrink-0 flex items-center justify-center size-8 rounded-full border bg-white border-gray-200 text-gray-600">
        <Bot className="size-4" />
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="size-1.5 rounded-full bg-gray-400"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function ConversationPage() {
  const { convoId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [message, setMessage] = useState('')
  const [stagedFiles, setStagedFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [blockedError, setBlockedError] = useState<string | null>(null)
  // Optimistically rendered messages before refetch
  const [pendingMessages, setPendingMessages] = useState<Dialogue[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['conversation', convoId],
    queryFn: () => chatApi.getConversation(convoId),
  })

  const sendMutation = useMutation({

    mutationFn: (payload: { message: string; files: File[] }) =>
      chatApi.continueConversation(convoId, payload.message, payload.files),
    onMutate: (payload) => {
      const userMsg: Dialogue = {
        _id: `pending-${Date.now()}`,
        conversation_id: convoId,
        content: payload.message,
        sent_by: 'user',
        timestamp: new Date().toISOString(),
        files: payload.files.map(f => ({ name: f.name, path: '' })),
      }
      setPendingMessages([userMsg])
      setMessage('')
      setStagedFiles([])
      setBlockedError(null)
    },
    onSuccess: (result: any) => {
      if (!result.is_safe) {
        setBlockedError('Your message was flagged and could not be processed.')
        setPendingMessages([])
        return
      }
      // Refetch the full history to get both messages persisted
      queryClient.invalidateQueries({ queryKey: ['conversation', convoId] })
      setPendingMessages([])
    },
    onError: () => {
      setPendingMessages([])
      setBlockedError('Something went wrong. Please try again.')
    },
  })

  const dialogues = data?.dialogues ?? []
  const title = data?.conversation?.title ?? 'Conversation'
  const allMessages = [...dialogues, ...pendingMessages]

  const totalItems = allMessages.length + (sendMutation.isPending ? 1 : 0)

  const virtualizer = useVirtualizer({
    count: totalItems,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 100,
    overscan: 5,
  })

  // Scroll to bottom on new messages or typing indicator
  useEffect(() => {
    if (totalItems > 0) {
      virtualizer.scrollToIndex(totalItems - 1, { behavior: 'smooth' })
    }
  }, [totalItems])

  const canSend = message.trim().length > 0 && !sendMutation.isPending

  const handleSend = () => {
    if (!canSend) return
    sendMutation.mutate({ message: message.trim(), files: stagedFiles })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const addFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return
    const incoming = Array.from(newFiles)
    setStagedFiles(prev => [...prev, ...incoming].slice(0, MAX_FILES))
  }, [])

  const removeFile = (index: number) => {
    setStagedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const splitFileName = (name: string) => {
    const lastDot = name.lastIndexOf('.')
    if (lastDot === -1) return { base: name, ext: '' }
    return { base: name.substring(0, lastDot), ext: name.substring(lastDot) }
  }

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target)
    console.log((e.target.files as FileList)[0])
    addFiles(e.target.files)
    // if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="bg-transparent h-dvh w-full flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-3xl px-4 pt-6 pb-2 flex items-center gap-3">
        <button
          onClick={() => navigate({ to: '/chat' })}
          className="p-2 rounded-full hover:bg-black/5 text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="text-black font-semibold text-lg truncate">{title}</h1>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className='flex-1 w-full overflow-y-auto'>
        <div
          className="relative w-full max-w-3xl px-4 py-4 mx-auto"
          style={{ height: `${virtualizer.getTotalSize()}px` }}
        >
          {isLoading && (
            <div className="flex justify-center pt-12 text-gray-400 text-sm">Loading...</div>
          )}
          {isError && (
            <div className="flex justify-center pt-12 text-red-400 text-sm">
              Failed to load conversation.
            </div>
          )}
          {virtualizer.getVirtualItems().map((virtualItem: any) => {
            const isTyping = virtualItem.index === allMessages.length
            return (
              <div
                key={virtualItem.key}
                ref={virtualizer.measureElement}
                data-index={virtualItem.index}
                style={{
                  position: 'absolute',
                  top: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                className="pb-4"
              >
                {isTyping ? (
                  <TypingIndicator />
                ) : (
                  <MessageBubble
                    dialogue={allMessages[virtualItem.index]}
                    animate={pendingMessages.some(p => p._id === allMessages[virtualItem.index]._id)}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Input bar — fixed at bottom */}
      <div className="w-full max-w-3xl px-4 pb-6 pt-2 shrink-0">
        <div className="flex flex-row items-end gap-4">

          {/* Error banner */}
          <div className="absolute -top-10 left-0 right-0 px-4 flex justify-center">
            <AnimatePresence>
              {(blockedError || sendMutation.isError) && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
                >
                  <AlertTriangle className="size-4 shrink-0" />
                  {blockedError ?? 'Something went wrong. Please try again.'}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Textarea + files */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files) }}
            className={`flex flex-col flex-1 h-auto bg-white/80 backdrop-blur-md border-2 rounded-3xl text-black text-md shadow-sm transition-all duration-200 ${isDragging ? 'border-amber-500 bg-amber-50/30' : 'border-amber-400'
              }`}
          >
            {/* Staged files */}
            <div className="flex flex-wrap gap-2 px-4 pt-3 empty:pt-0">
              <AnimatePresence mode="popLayout">
                {stagedFiles.map((file, index) => {
                  const { base, ext } = splitFileName(file.name)
                  return (
                    <motion.div
                      layout
                      key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ type: 'spring', duration: 0.4, bounce: 0.3 }}
                      className="flex items-center gap-1.5 bg-gray-100/50 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-gray-200"
                    >
                      <div className="text-gray-500">{getFileIcon(file.name)}</div>
                      <div className="flex items-baseline text-xs font-medium max-w-[150px]">
                        <span className="text-gray-700 truncate">{base}</span>
                        <span className="text-gray-500 shrink-0">{ext}</span>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="p-0.5 ml-0.5 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            <div className="flex flex-row items-start px-3 py-2">
              <div className='flex shrink-0 items-center justify-center pt-0.5'>
                <FolderPlus
                  onClick={handleFileClick}
                  className='p-2 size-9 text-gray-500 rounded-full hover:scale-105 hover:bg-gray-100 hover:text-gray-800 transition-all cursor-pointer'
                />
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sendMutation.isPending}
                className="w-full field-sizing-content px-3 py-1.5 bg-transparent focus:outline-none text-md text-wrap resize-none overflow-hidden leading-relaxed disabled:opacity-50"
                rows={1}
                placeholder="Reply..."
              />
            </div>
          </div>

          {/* Send button */}
          <motion.button
            onClick={handleSend}
            disabled={!canSend}
            className="flex size-14 rounded-full bg-amber-400 hover:bg-amber-500 transition-colors shadow-sm justify-center items-center shrink-0 mb-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
            whileHover={canSend ? { rotate: -25 } : {}}
          >
            {sendMutation.isPending
              ? <motion.div className="size-5 border-2 border-black/30 border-t-black rounded-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} />
              : <SendHorizontal className="text-black size-6" />
            }
          </motion.button>
        </div>
      </div>
    </div>
  )
}