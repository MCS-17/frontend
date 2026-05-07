import { createFileRoute } from '@tanstack/react-router'
import { 
  Folder, 
  File, 
  FileText, 
  FileCode, 
  FileImage, 
  Download, 
  Trash2, 
  Eye, 
  ChevronRight,
  Home,
  RefreshCw,
  FolderPlus,
  Upload,
  X,
  Edit2
} from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"

export const Route = createFileRoute('/storage')({
  component: StoragePage,
})

const MOCK_FILES = [
  { id: '1', name: 'research_data_v2.csv', type: 'text', size: '2.4 GB', modified: '2 hours ago' },
  { id: '2', name: 'simulation_results', type: 'folder', size: '--', modified: 'Yesterday' },
  { id: '3', name: 'model_weights_epoch_50.pt', type: 'code', size: '840 MB', modified: '3 days ago' },
  { id: '4', name: 'training_viz.png', type: 'image', size: '4.2 MB', modified: '5 days ago' },
  { id: '5', name: 'user_logs', type: 'folder', size: '--', modified: '1 week ago' },
  { id: '6', name: 'setup_script.sh', type: 'code', size: '12 KB', modified: '2 weeks ago' },
]

const getFileIcon = (type: string) => {
  switch (type) {
    case 'folder': return <Folder className="size-5 text-amber-400 fill-amber-400/20" />
    case 'text': return <FileText className="size-5 text-blue-500" />
    case 'code': return <FileCode className="size-5 text-purple-500" />
    case 'image': return <FileImage className="size-5 text-green-500" />
    default: return <File className="size-5 text-gray-400" />
  }
}

function StoragePage() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null)
  const [currentPath, setCurrentPath] = useState<string[]>([]) // Alias for /mnt/beegfs/user/<user_id>
  
  const handleSelect = (e: React.MouseEvent, id: string) => {
    const isShift = e.shiftKey
    const isCtrl = e.ctrlKey || e.metaKey
    
    setSelectedIds(prev => {
      const next = new Set(prev)

      if (isShift && lastSelectedId) {
        const currentIndex = MOCK_FILES.findIndex(f => f.id === id)
        const lastIndex = MOCK_FILES.findIndex(f => f.id === lastSelectedId)
        
        if (currentIndex === -1 || lastIndex === -1) return prev

        const [start, end] = [Math.min(currentIndex, lastIndex), Math.max(currentIndex, lastIndex)]
        const rangeIds = MOCK_FILES.slice(start, end + 1).map(f => f.id)
        rangeIds.forEach(rid => next.add(rid))
      } else if (isCtrl) {
        if (next.has(id)) {
          next.delete(id)
        } else {
          next.add(id)
        }
      } else {
        next.clear()
        next.add(id)
      }
      
      return next
    })
    
    setLastSelectedId(id)
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
        className="flex-1 min-h-0 bg-white/50 backdrop-blur-2xl border border-white/20 rounded-xl shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col relative"
      >
        {/* Table Header */}
        <div className="grid grid-cols-[1fr_100px_180px_120px] gap-2 px-6 py-3 border-b border-white/20 bg-white/40 text-[10px] font-bold uppercase tracking-widest text-slate-400 items-center">
          <div className="pl-2">Name</div>
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
                onClick={(e) => handleSelect(e, file.id)}
                onDoubleClick={() => isFolder ? handleFolderClick(file.name) : setPreviewFile(file)}
                className={`grid grid-cols-[1fr_100px_180px_120px] gap-2 px-6 py-2.5 items-center border-b border-slate-50 hover:bg-slate-100/50 transition-colors group cursor-pointer select-none ${isSelected ? "bg-amber-400/10 border-l-4 border-l-amber-400 pl-[21px]" : "pl-6"}`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="shrink-0">{getFileIcon(file.type)}</div>
                  <span className="text-sm font-semibold text-slate-700 truncate group-hover:text-slate-900 transition-colors">
                    {file.name}
                  </span>
                </div>
                <div className="text-[13px] text-slate-500 font-medium text-right pr-4">{file.size}</div>
                <div className="text-[13px] text-slate-500 font-medium">{file.modified}</div>
                <div className="flex items-center justify-end pr-2">
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!isFolder ? (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setPreviewFile(file); }}
                        title="Quick Look" 
                        className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-200/50 rounded-lg transition-all"
                      >
                        <Eye className="size-4" />
                      </button>
                    ) : null}
                    <button title="Download" className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-200/50 rounded-lg transition-all">
                      <Download className="size-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setDeleteFiles([file.id]); }}
                      title="Delete" 
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}

          {/* Inline Action Row */}
          <div className="grid grid-cols-[1fr_100px_180px_120px] gap-2 px-6 py-4 items-center bg-slate-50/50 border-t border-slate-100/50 group">
            <div className="flex items-center gap-4 overflow-hidden pl-2">
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-zinc-400 hover:text-zinc-900 hover:bg-black/5 rounded-xl transition-all border border-transparent hover:border-zinc-200">
                <FolderPlus className="size-4" />
                New Folder
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-zinc-400 hover:text-zinc-900 hover:bg-black/5 rounded-xl transition-all border border-transparent hover:border-zinc-200">
                <Upload className="size-4" />
                Upload Files
              </button>
            </div>
          </div>
        </div>

        {/* Selection Toolbar (Floating) */}
        <AnimatePresence>
          {selectedIds.size > 0 ? (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="flex items-center gap-4 px-6 py-3 bg-white/80 backdrop-blur-2xl border border-slate-200 shadow-2xl shadow-slate-200/60 rounded-xl text-slate-900"
              >
                <span className="text-sm font-bold bg-slate-100 px-2 py-0.5 rounded-lg text-slate-600">
                  {selectedIds.size} Selected
                </span>
                <div className="h-4 w-px bg-slate-200" />
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 rounded-lg transition-colors text-sm font-semibold">
                    <Download className="size-4" />
                    Download
                  </button>
                  <button 
                    onClick={() => setDeleteFiles(Array.from(selectedIds))}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors text-sm font-semibold"
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </button>
                </div>
                <div className="h-4 w-px bg-slate-200" />
                <button 
                  onClick={() => { setSelectedIds(new Set()); setLastSelectedId(null); }}
                  className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                >
                  <X className="size-4 text-slate-400 hover:text-slate-900" />
                </button>
              </motion.div>
            </div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Context Menu Layer */}
      <AnimatePresence>
        {contextMenu ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.1, ease: "circOut" }}
            style={{ left: contextMenu.x, top: contextMenu.y }}
            className="fixed z-[200] min-w-[180px] bg-white/90 backdrop-blur-2xl border border-slate-200/50 rounded-xl shadow-2xl p-1.5 flex flex-col gap-0.5"
          >
            {contextMenu.type === 'file' ? (
              <>
                <button className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-left">
                  <Download className="size-4" />
                  Download
                </button>
                <button className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-left">
                  <Edit2 className="size-4" />
                  Rename
                </button>
                <div className="h-px bg-slate-100 my-1 mx-2" />
                <button 
                  onClick={() => setDeleteFiles([contextMenu.targetId!])}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                >
                  <Trash2 className="size-4" />
                  Delete
                </button>
              </>
            ) : (
              <>
                <button className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-left">
                  <FolderPlus className="size-4" />
                  New Folder
                </button>
                <button className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-left">
                  <Upload className="size-4" />
                  Upload Files
                </button>
                <div className="h-px bg-slate-100 my-1 mx-2" />
                <button className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-left">
                  <RefreshCw className="size-4" />
                  Refresh
                </button>
              </>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Modals Layer */}
      <AnimatePresence>
        {/* Quick Look Preview Modal */}
        {previewFile ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewFile(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div 
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-4xl max-h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  {getFileIcon(previewFile.type)}
                  <div>
                    <h3 className="font-bold text-slate-900 leading-none">{previewFile.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{previewFile.size} • Modified {previewFile.modified}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    title="Download File"
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-900"
                  >
                    <Download className="size-5" />
                  </button>
                  <button 
                    onClick={() => setPreviewFile(null)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="size-5 text-slate-500" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-10 bg-slate-50/30">
                <div className="w-full h-64 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                  <FileCode className="size-12 mb-4 opacity-20" />
                  <p className="font-medium italic text-sm">Preview content for {previewFile.name} would be loaded here...</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}

        {/* Delete Confirmation Modal */}
        {deleteFiles.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8"
            >
              <div className="size-14 rounded-xl bg-red-50 flex items-center justify-center text-red-600 mb-6">
                <Trash2 className="size-7" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Delete {deleteFiles.length} item(s)?</h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                This action is permanent and cannot be undone. These files will be removed from your User Storage Root on the HPC cluster.
              </p>
              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => setDeleteFiles([])}
                  className="flex-1 px-6 py-3 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    // Logic to delete files would go here
                    setDeleteFiles([])
                    setSelectedIds(new Set())
                  }}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                >
                  Delete Forever
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
