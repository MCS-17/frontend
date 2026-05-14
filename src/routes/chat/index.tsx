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
  AlertTriangle
} from "lucide-react"
import { useRef, useState, useCallback } from "react"
import { chatApi } from "@/lib/chat"

export const Route = createFileRoute('/chat/')({
  component: ChatPage,
})

const MAX_FILES = 10

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
    mutationFn: () => chatApi.createConversation(message.trim(), stagedFiles),
    onSuccess: (data) => {
      if (!data.is_safe) {
        setBlockedError("Your message was flagged and could not be processed.")
        return
      }

      queryClient.invalidateQueries({ queryKey: ["conversations"] })
      // Navigate to the conversation page once you build it
      navigate({ to: '/chat/$convoId', params: { convoId: data.convo_id! } })
    },
  })

  const canSend = message.trim().length > 0 && !createMutation.isPending

  const handleSend = () => {
    if (!canSend) return
    setBlockedError(null)
    createMutation.mutate()
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
          <div 
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`flex flex-col w-2/5 h-auto bg-white/80 backdrop-blur-md border-2 rounded-3xl text-black text-md shadow-sm transition-all duration-200 ${
              isDragging ? 'border-amber-500 bg-amber-50/30' : 'border-amber-400'
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
          <motion.button className='flex size-14 rounded-full bg-amber-400 hover:bg-amber-500 transition-colors shadow-sm justify-center items-center shrink-0 mt-0.5'
            onClick={handleSend}
            disabled={!canSend}
            whileHover={canSend ? { rotate: -25 } : {}}>
            {createMutation.isPending
              ? <motion.div className="size-5 border-2 border-black/30 border-t-black rounded-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} />
              : <SendHorizontal className='text-black size-6'/>
            }
          </motion.button>
        </div>
      </div>
    </div>
  )
}