import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from "motion/react"
import {
  FolderPlus,
  SendHorizontal,
  X,
  FileText,
  FileImage,
  FileCode,
  FileJson,
  FileArchive,
  File,
  AlertTriangle,
  Sparkles // Added for the suggestion section header
} from "lucide-react"
import { useRef, useState, useCallback } from "react"
import { chatApi } from "@/lib/chat"

export const Route = createFileRoute('/chat/')({
  component: ChatPage,
})

const MAX_FILES = 10

// Relevant HPC prompt suggestions matching the image's dual-text layout style
const HPC_SUGGESTIONS = [
  {
    title: "Check active jobs",
    description: "Show my running SLURM jobs",
    prompt: "Show my currently running SLURM jobs"
  },
  {
    title: "Run node diagnostics",
    description: "Perform a ping sweep across compute nodes",
    prompt: "Perform a ping sweep to check node reachability"
  },
  {
    title: "Explore workspace files",
    description: "List files in my BeeGFS user directory",
    prompt: "List files in my workspace directory"
  }
]

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg':
    case 'webp':
      return <FileImage className="size-4" />
    case 'txt':
    case 'md':
    case 'pdf':
    case 'doc':
    case 'docx':
      return <FileText className="size-4" />
    case 'js':
    case 'ts':
    case 'tsx':
    case 'jsx':
    case 'py':
    case 'cpp':
    case 'h':
    case 'c':
    case 'go':
    case 'rs':
      return <FileCode className="size-4" />
    case 'json':
      return <FileJson className="size-4" />
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
      return <FileArchive className="size-4" />
    default:
      return <File className="size-4" />
  }
}

function ChatPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [stagedFiles, setStagedFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ai messages time
  const [message, setMessage] = useState('')
  const [blockedError, setBlockedError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const createMutation = useMutation({
    mutationKey: ['createConversation'],
    mutationFn: (vars: { message: string; files: File[]; pendingId: string }) =>
      chatApi.createConversation(vars.message.trim(), vars.files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] })
    },
  })

  const canSend = message.trim().length > 0 && !createMutation.isPending

  // Modified to accept an explicit string for prompt click automation
  const handleSend = (explicitMessage?: string) => {
    const textToSend = typeof explicitMessage === 'string' ? explicitMessage.trim() : message.trim()
    if (!textToSend || createMutation.isPending) return

    setBlockedError(null)

    // Generate an isolated temporary ID for this specific room session
    const pendingId = `pending-${Date.now()}`
    const filesToSend = [...stagedFiles]

    // Wipe out local inputs instantly so the base chat is clear for another message
    setMessage('')
    setStagedFiles([])

    // Pass everything into the global state manager
    createMutation.mutate({
      message: textToSend,
      files: filesToSend,
      pendingId
    })

    // Instantly jump out to the new concurrent pending screen
    navigate({ to: '/chat/$convoId', params: { convoId: pendingId } })
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

    setStagedFiles(prev => {
      const combined = [...prev, ...incoming].slice(0, MAX_FILES)
      return combined
    })
  }, [])

  const removeFile = (index: number) => {
    setStagedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const splitFileName = (name: string) => {
    const lastDotIndex = name.lastIndexOf('.')
    if (lastDotIndex === -1) return { base: name, ext: '' }
    return {
      base: name.substring(0, lastDotIndex),
      ext: name.substring(lastDotIndex)
    }
  }

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = () => {
    setIsDragging(false)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    addFiles(e.dataTransfer.files)
  }

  return (
    <div className="bg-transparent min-h-dvh w-full flex flex-col items-center pt-[35vh]">
      <div className="flex flex-col items-center h-auto w-full">
        <div className='flex flex-col items-center pb-5'>
          <div className='text-black text-3xl font-semibold'>Welcome Back!</div>
        </div>

        {/* Blocked/error message */}
        <AnimatePresence>
          {(blockedError || createMutation.isError) && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2 mb-4 px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
            >
              <AlertTriangle className="size-4 shrink-0" />
              {blockedError ?? 'Something went wrong. Please try again.'}
            </motion.div>
          )}
        </AnimatePresence>

        <div className='flex flex-row w-full h-auto space-x-5 justify-center items-start'>
          {/* Left Wrapper: Input Group + Suggested Prompt Section */}
          <div className="flex flex-col w-2/5 gap-6">
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`flex flex-col w-full h-auto bg-white/80 backdrop-blur-md border-2 rounded-3xl text-black text-md shadow-sm transition-all duration-200 ${isDragging ? 'border-amber-500 bg-amber-50/30' : 'border-amber-400'
                }`}
            >
              {/* Staged Files Display */}
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
                        transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
                        className="flex items-center gap-1.5 bg-gray-100/50 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-gray-200 group"
                      >
                        <div className="text-gray-500">
                          {getFileIcon(file.name)}
                        </div>
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
                  disabled={createMutation.isPending}
                  className="w-full field-sizing-content px-3 py-1.5 bg-transparent focus:outline-none text-md text-wrap resize-none overflow-hidden leading-relaxed"
                  rows={1}
                  placeholder="I want to..."
                ></textarea>
              </div>
            </div>
          </div>

          {/* Right Column: Send Action Button */}
          <motion.button className='flex size-14 rounded-full bg-amber-400 hover:bg-amber-500 transition-colors shadow-sm justify-center items-center shrink-0 mt-0.5'
            onClick={() => handleSend()}
            disabled={!canSend}
            whileHover={canSend ? { rotate: -25 } : {}}>
            {createMutation.isPending
              ? <motion.div className="size-5 border-2 border-black/30 border-t-black rounded-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} />
              : <SendHorizontal className='text-black size-6' />
            }
          </motion.button>
        </div>

        {/* Suggested Prompts Grid */}
        <div className="flex flex-col w-2/5 items-start px-2 pt-5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 select-none">
            <Sparkles className="size-3.5 text-amber-500" />
            Recommended
          </div>
          <div className="flex flex-col w-full">
            {HPC_SUGGESTIONS.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSend(suggestion.prompt)}
                disabled={createMutation.isPending}
                className="flex flex-col items-start text-left w-full p-3 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all cursor-pointer group disabled:opacity-50 disabled:pointer-events-none"
              >
                <span className="text-sm font-semibold text-gray-800 group-hover:text-amber-500 transition-colors">
                  {suggestion.title}
                </span>
                <span className="text-xs text-gray-400 mt-0.5">
                  {suggestion.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}