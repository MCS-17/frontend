import { createFileRoute } from '@tanstack/react-router'
import { motion, AnimatePresence } from "motion/react"
import { 
  Folder, 
  FileImage, 
  FileCode, 
  FileJson, 
  FileArchive, 
  File,
  Home,
  ChevronRight,
  Download,
  Trash2,
  Eye,
  Plus,
  Upload,
  Check,
  X,
  RefreshCw,
  Edit2,
  FolderPlus
} from "lucide-react"
import { useState, useEffect } from "react"

export const Route = createFileRoute('/storage')({
  component: StoragePage,
})

// Mock Data for the filesystem
const MOCK_FILES = [
  { id: '1', name: 'projects', type: 'folder', size: '-', modified: '2024-05-01 14:30' },
  { id: '2', name: 'dataset_v1.zip', type: 'archive', size: '2.4 GB', modified: '2024-04-28 09:15' },
  { id: '3', name: 'analysis.py', type: 'code', size: '12 KB', modified: '2024-05-02 11:20' },
  { id: '4', name: 'results.json', type: 'json', size: '450 KB', modified: '2024-05-03 16:45' },
  { id: '5', name: 'model_weights.pt', type: 'file', size: '850 MB', modified: '2024-05-01 10:00' },
]

const getFileIcon = (type: string) => {
  switch (type) {
    case 'folder': return <Folder className="size-5 text-amber-500 fill-amber-500/20" />
    case 'archive': return <FileArchive className="size-5 text-blue-500" />
    case 'code': return <FileCode className="size-5 text-purple-500" />
    case 'json': return <FileJson className="size-5 text-orange-500" />
    case 'image': return <FileImage className="size-5 text-green-500" />
    default: return <File className="size-5 text-gray-400" />
  }
}

function StoragePage() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [currentPath, setCurrentPath] = useState<string[]>([]) // Alias for /mnt/beegfs/user/<user_id>
  
  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === MOCK_FILES.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(MOCK_FILES.map(f => f.id)))
  }

  const [previewFile, setPreviewFile] = useState<typeof MOCK_FILES[0] | null>(null)
  const [deleteFiles, setDeleteFiles] = useState<string[]>([]) // IDs to delete
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, type: 'file' | 'background', targetId?: string } | null>(null)

  const handleContextMenu = (e: React.MouseEvent, type: 'file' | 'background', targetId?: string) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, type, targetId })
  }

  useEffect(() => {
    const handleClick = () => setContextMenu(null)
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  const handleFolderClick = (folderName: string) => {
    setCurrentPath(prev => [...prev, folderName])
  }

  const navigateBack = (index: number) => {
    setCurrentPath(prev => prev.slice(0, index + 1))
  }

  return (
    <div className="p-6 lg:p-10 flex flex-col h-full gap-6 relative">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Files & Storage</h1>
        </div>

        {/* Path Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm font-medium">
          <button 
            onClick={() => setCurrentPath([])}
            className="p-1.5 rounded-lg hover:bg-black/5 text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <Home className="size-4" />
          </button>
          <ChevronRight className="size-4 text-zinc-300" />
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setCurrentPath([])}
              className="px-2 py-1 text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              My Files
            </button>
            {currentPath.map((segment, i) => (
              <div key={i} className="flex items-center gap-1">
                <ChevronRight className="size-4 text-zinc-300" />
                <button 
                  onClick={() => navigateBack(i)}
                  className="px-2 py-1 rounded-md hover:bg-black/5 text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  {segment}
                </button>
              </div>
            ))}
          </div>
        </nav>
      </div>

      {/* File List Table */}
      <div 
        onContextMenu={(e) => handleContextMenu(e, 'background')}
        className="flex-1 min-h-0 bg-white/60 backdrop-blur-3xl border border-zinc-200/50 rounded-[2rem] shadow-xl shadow-zinc-200/50 overflow-hidden flex flex-col relative"
      >
        {/* Table Header */}
        <div className="grid grid-cols-[48px_1fr_100px_180px_120px] gap-2 px-6 py-3 border-b border-zinc-100 bg-white/40 text-[10px] font-bold uppercase tracking-widest text-zinc-400 items-center">
          <div className="flex items-center justify-center">
            <button 
              onClick={toggleSelectAll}
              className={`size-4 rounded-md border-2 transition-all flex items-center justify-center ${
                selectedIds.size === MOCK_FILES.length 
                ? "bg-amber-400 border-amber-400" 
                : "border-zinc-200 hover:border-zinc-300 bg-white"
              }`}
            >
              {selectedIds.size === MOCK_FILES.length && <Check className="size-2.5 text-black stroke-[3px]" />}
            </button>
          </div>
          <div>Name</div>
          <div className="text-right pr-4">Size</div>
          <div>Last Modified</div>
          <div className="text-right pr-2">Actions</div>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto">
          {MOCK_FILES.map((file) => {
            const isSelected = selectedIds.has(file.id)
            const isFolder = file.type === 'folder'
            return (
              <motion.div 
                key={file.id}
                onContextMenu={(e) => handleContextMenu(e, 'file', file.id)}
                className={`grid grid-cols-[48px_1fr_100px_180px_120px] gap-2 px-6 py-2.5 items-center border-b border-zinc-50 hover:bg-amber-50/30 transition-colors group ${isSelected ? "bg-amber-50/50" : ""}`}
              >
                <div className="flex items-center justify-center">
                  <button 
                    onClick={() => toggleSelect(file.id)}
                    className={`size-4 rounded-md border-2 transition-all flex items-center justify-center ${
                      isSelected 
                      ? "bg-amber-400 border-amber-400" 
                      : "border-zinc-200 group-hover:border-zinc-300 bg-white"
                    }`}
                  >
                    {isSelected && <Check className="size-2.5 text-black stroke-[3px]" />}
                  </button>
                </div>
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="shrink-0">{getFileIcon(file.type)}</div>
                  <span 
                    onClick={() => isFolder ? handleFolderClick(file.name) : setPreviewFile(file)}
                    className="text-sm font-semibold text-zinc-700 truncate group-hover:text-black transition-colors cursor-pointer"
                  >
                    {file.name}
                  </span>
                </div>
                <div className="text-[13px] text-zinc-500 font-medium text-right pr-4">{file.size}</div>
                <div className="text-[13px] text-zinc-500 font-medium">{file.modified}</div>
                <div className="flex items-center justify-end pr-2">
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!isFolder && (
                      <button 
                        onClick={() => setPreviewFile(file)}
                        title="Quick Look" 
                        className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-black/5 rounded-lg transition-all"
                      >
                        <Eye className="size-4" />
                      </button>
                    )}
                    <button title="Download" className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-black/5 rounded-lg transition-all">
                      <Download className="size-4" />
                    </button>
                    <button 
                      onClick={() => setDeleteFiles([file.id])}
                      title="Delete" 
                      className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}

          {/* Inline Action Row */}
          <div className="grid grid-cols-[48px_1fr_100px_180px_120px] gap-2 px-6 py-4 items-center bg-zinc-50/30 border-t border-zinc-100/50 group">
            <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Plus className="size-4 text-zinc-300" />
            </div>
            <div className="flex items-center gap-4 overflow-hidden">
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-zinc-400 hover:text-zinc-900 hover:bg-black/5 rounded-xl transition-all border border-transparent hover:border-zinc-200">
                <FolderPlus className="size-4" />
                New Folder
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-zinc-400 hover:text-zinc-900 hover:bg-black/5 rounded-xl transition-all border border-transparent hover:border-zinc-200">
                <Upload className="size-4" />
                Upload Files
              </button>
            </div>
            <div className="col-span-3" />
          </div>
        </div>

        {/* Selection Toolbar (Floating) */}
        <AnimatePresence>
          {selectedIds.size > 0 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="flex items-center gap-4 px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/40 text-white"
              >
                <span className="text-sm font-bold bg-white/10 px-2 py-0.5 rounded-lg">
                  {selectedIds.size} Selected
                </span>
                <div className="h-4 w-px bg-white/10" />
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-xl transition-colors text-sm font-semibold">
                    <Download className="size-4" />
                    Download
                  </button>
                  <button 
                    onClick={() => setDeleteFiles(Array.from(selectedIds))}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors text-sm font-semibold"
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </button>
                </div>
                <div className="h-4 w-px bg-white/10" />
                <button 
                  onClick={() => setSelectedIds(new Set())}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="size-4" />
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Context Menu Layer */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.1, ease: "circOut" }}
            style={{ left: contextMenu.x, top: contextMenu.y }}
            className="fixed z-[200] min-w-[180px] bg-white/80 backdrop-blur-2xl border border-zinc-200/50 rounded-2xl shadow-2xl p-1.5 flex flex-col gap-0.5"
          >
            {contextMenu.type === 'file' ? (
              <>
                <button className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-black/5 rounded-xl transition-colors text-left">
                  <Download className="size-4" />
                  Download
                </button>
                <button className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-black/5 rounded-xl transition-colors text-left">
                  <Edit2 className="size-4" />
                  Rename
                </button>
                <div className="h-px bg-zinc-100 my-1 mx-2" />
                <button 
                  onClick={() => setDeleteFiles([contextMenu.targetId!])}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left"
                >
                  <Trash2 className="size-4" />
                  Delete
                </button>
              </>
            ) : (
              <>
                <button className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-black/5 rounded-xl transition-colors text-left">
                  <FolderPlus className="size-4" />
                  New Folder
                </button>
                <button className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-black/5 rounded-xl transition-colors text-left">
                  <Upload className="size-4" />
                  Upload Files
                </button>
                <div className="h-px bg-zinc-100 my-1 mx-2" />
                <button className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-black/5 rounded-xl transition-colors text-left">
                  <RefreshCw className="size-4" />
                  Refresh
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals Layer */}
      <AnimatePresence>
        {/* Quick Look Preview Modal */}
        {previewFile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewFile(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
          >
            <motion.div 
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-4xl max-h-[80vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="px-8 py-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                <div className="flex items-center gap-4">
                  {getFileIcon(previewFile.type)}
                  <div>
                    <h3 className="font-bold text-zinc-900 leading-none">{previewFile.name}</h3>
                    <p className="text-xs text-zinc-500 mt-1">{previewFile.size} • Modified {previewFile.modified}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    title="Download File"
                    className="p-2 hover:bg-black/5 rounded-xl transition-colors text-zinc-500 hover:text-zinc-900"
                  >
                    <Download className="size-5" />
                  </button>
                  <button 
                    onClick={() => setPreviewFile(null)}
                    className="p-2 hover:bg-black/5 rounded-xl transition-colors"
                  >
                    <X className="size-5 text-zinc-500" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-10 bg-zinc-50/30">
                <div className="w-full h-64 rounded-2xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-400">
                  <FileCode className="size-12 mb-4 opacity-20" />
                  <p className="font-medium italic">Preview content for {previewFile.name} would be loaded here...</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteFiles.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8"
            >
              <div className="size-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 mb-6">
                <Trash2 className="size-7" />
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 tracking-tight mb-2">Delete {deleteFiles.length} item(s)?</h3>
              <p className="text-zinc-500 leading-relaxed">
                This action is permanent and cannot be undone. These files will be removed from your User Storage Root on the HPC cluster.
              </p>
              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => setDeleteFiles([])}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-zinc-600 hover:bg-zinc-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    // Logic to delete files would go here
                    setDeleteFiles([])
                    setSelectedIds(new Set())
                  }}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                >
                  Delete Forever
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
