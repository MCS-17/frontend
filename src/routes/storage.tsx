import { createFileRoute } from "@tanstack/react-router"
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
  AlertCircle,
  CheckSquare,
  Square,
} from "lucide-react"
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  createFolder,
  deleteItem,
  downloadFile,
  listDirectory,
  uploadFile,
  type StorageItem,
} from "../lib/files"

export const Route = createFileRoute("/storage")({
  component: StoragePage,
})

const getFileIcon = (item: StorageItem) => {
  if (item.type === "folder") {
    return <Folder className="size-5 text-amber-400 fill-amber-400/20" />
  }

  const extension = item.name.split(".").pop()?.toLowerCase()

  if (
    extension &&
    ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"].includes(extension)
  ) {
    return <FileImage className="size-5 text-green-500" />
  }

  if (
    extension &&
    [
      "js",
      "ts",
      "tsx",
      "jsx",
      "py",
      "java",
      "cpp",
      "c",
      "sh",
      "json",
      "html",
      "css",
    ].includes(extension)
  ) {
    return <FileCode className="size-5 text-purple-500" />
  }

  if (
    extension &&
    ["txt", "csv", "md", "pdf", "doc", "docx", "xls", "xlsx"].includes(
      extension,
    )
  ) {
    return <FileText className="size-5 text-blue-500" />
  }

  return <File className="size-5 text-gray-400" />
}

const formatSize = (bytes: number | null) => {
  if (bytes === null) return "--"
  if (bytes === 0) return "0 B"

  const units = ["B", "KB", "MB", "GB", "TB"]
  const index = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = bytes / Math.pow(1024, index)

  return `${size.toFixed(size >= 10 || index === 0 ? 0 : 1)} ${units[index]}`
}

const formatModified = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleString()
}

const joinPath = (parts: string[]) => {
  return parts.filter(Boolean).join("/")
}

function StoragePage() {
  const uploadInputRef = useRef<HTMLInputElement | null>(null)

  const [items, setItems] = useState<StorageItem[]>([])
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set())
  const [currentPath, setCurrentPath] = useState("")
  const [previewItem, setPreviewItem] = useState<StorageItem | null>(null)
  const [deleteItems, setDeleteItems] = useState<StorageItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")

  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [hideLogs, setHideLogs] = useState(true)

  const filteredItems = useMemo(() => {
    if (!hideLogs) return items

    return items.filter((item) => {
      if (item.type === "folder") return true
      return !item.name.endsWith(".err") && !item.name.endsWith(".out")
    })
  }, [items, hideLogs])

  const pathSegments = useMemo(() => {
    return currentPath ? currentPath.split("/") : []
  }, [currentPath])

  const selectedItems = useMemo(() => {
    return items.filter((item) => selectedPaths.has(item.path))
  }, [items, selectedPaths])

  const loadFiles = async (path = currentPath) => {
    setIsLoading(true)
    setError("")

    try {
      const response = await listDirectory(path)

      setItems(response.items)
      setCurrentPath(response.currentPath)
      setSelectedPaths(new Set())
    } catch (err) {
      console.error("Load files failed:", err)
      setError(err instanceof Error ? err.message : "Failed to load files")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadFiles("")
  }, [])

  const handleRowClick = (item: StorageItem) => {
    if (item.type === "folder") {
      void loadFiles(item.path)
      return
    }

    setPreviewItem(item)
  }

  const handleToggleSelect = (item: StorageItem) => {
    setSelectedPaths((previous) => {
      const next = new Set(previous)

      if (next.has(item.path)) {
        next.delete(item.path)
      } else {
        next.add(item.path)
      }

      return next
    })
  }

  const handleSelectAll = () => {
    if (filteredItems.length === 0) return

    setSelectedPaths((previous) => {
      if (previous.size === filteredItems.length) {
        return new Set()
      }

      return new Set(filteredItems.map((item) => item.path))
    })
  }

  const handleNavigateHome = () => {
    void loadFiles("")
  }

  const handleNavigateToSegment = (index: number) => {
    const nextPath = joinPath(pathSegments.slice(0, index + 1))
    void loadFiles(nextPath)
  }

  const handleOpenCreateFolderModal = () => {
    setNewFolderName("")
    setError("")
    setIsCreateFolderOpen(true)
  }

  const handleCreateFolder = async () => {
    const cleanFolderName = newFolderName.trim()

    if (!cleanFolderName) {
      setError("Folder name cannot be empty")
      return
    }

    const folderPath = currentPath
      ? `${currentPath}/${cleanFolderName}`
      : cleanFolderName

    setIsCreatingFolder(true)
    setError("")

    try {
      await createFolder(folderPath)
      setNewFolderName("")
      setIsCreateFolderOpen(false)
      await loadFiles(currentPath)
    } catch (err) {
      console.error("Create folder failed:", err)
      setError(err instanceof Error ? err.message : "Failed to create folder")
    } finally {
      setIsCreatingFolder(false)
    }
  }

  const handleUploadClick = () => {
    uploadInputRef.current?.click()
  }

  const handleUploadFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])

    if (files.length === 0) return

    setIsUploading(true)
    setError("")

    try {
      for (const file of files) {
        await uploadFile(file, currentPath, false)
      }

      await loadFiles(currentPath)
    } catch (err) {
      console.error("Upload failed:", err)
      setError(err instanceof Error ? err.message : "Failed to upload file")
    } finally {
      setIsUploading(false)
      event.target.value = ""
    }
  }

  const handleDownload = async (item: StorageItem) => {
    if (item.type === "folder") return

    setError("")

    try {
      await downloadFile(item.path)
    } catch (err) {
      console.error("Download failed:", err)
      setError(err instanceof Error ? err.message : "Failed to download file")
    }
  }

  const handleDeleteConfirmed = async () => {
    if (deleteItems.length === 0) return

    setError("")

    try {
      for (const item of deleteItems) {
        await deleteItem(item.path, item.type === "folder")
      }

      setDeleteItems([])
      await loadFiles(currentPath)
    } catch (err) {
      console.error("Delete failed:", err)
      setError(err instanceof Error ? err.message : "Failed to delete item")
    }
  }

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return
    setDeleteItems(selectedItems)
  }

  const handleDownloadSelected = async () => {
    const filesOnly = selectedItems.filter((item) => item.type === "file")

    for (const item of filesOnly) {
      await handleDownload(item)
    }
  }

  const isAllSelected = filteredItems.length > 0 && selectedPaths.size === filteredItems.length

  return (
    <div className="p-6 lg:p-10 flex flex-col h-full gap-6 relative">
      <input
        ref={uploadInputRef}
        type="file"
        multiple
        onChange={handleUploadFiles}
        className="hidden"
      />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
            Files & Storage
          </h1>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenCreateFolderModal}
              className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 hover:bg-black/5 rounded-xl transition-all cursor-pointer"
            >
              <FolderPlus className="size-4" />
              New Folder
            </button>

            <button
              type="button"
              onClick={handleUploadClick}
              disabled={isUploading}
              className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 hover:bg-black/5 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
            >
              <Upload className="size-4" />
              {isUploading ? "Uploading files..." : "Upload Files"}
            </button>

            <button
              type="button"
              onClick={() => void loadFiles(currentPath)}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 hover:bg-black/5 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw
                className={`size-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {error ? (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <AlertCircle className="size-5 shrink-0" />
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="ml-auto text-red-400 hover:text-red-700 cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : null}

        <div className="flex items-center justify-between">
          <nav className="flex items-center gap-2 text-sm font-medium">
            <button
              type="button"
              onClick={handleNavigateHome}
              className="p-1.5 rounded-lg hover:bg-black/5 text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
            >
              <Home className="size-4" />
            </button>

            <ChevronRight className="size-4 text-zinc-300" />

            <button
              type="button"
              onClick={handleNavigateHome}
              className="px-2 py-1 text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
            >
              My Storage
            </button>

            {pathSegments.map((segment, index) => (
              <div
                key={joinPath(pathSegments.slice(0, index + 1))}
                className="flex items-center gap-1"
              >
                <ChevronRight className="size-4 text-zinc-300" />

                <button
                  type="button"
                  onClick={() => handleNavigateToSegment(index)}
                  className="px-2 py-1 rounded-md hover:bg-black/5 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
                >
                  {segment}
                </button>
              </div>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => setHideLogs(!hideLogs)}
            className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer select-none"
          >
            <div className={`transition-colors ${hideLogs ? "text-amber-500" : "text-zinc-400"}`}>
              {hideLogs ? (
                <CheckSquare className="size-4" />
              ) : (
                <Square className="size-4" />
              )}
            </div>
            Hide .err and .out files
          </button>
        </div>
      </div>


      <div className="flex-1 min-h-0 bg-white/50 backdrop-blur-2xl border border-white/20 rounded-xl shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col relative">
        <div className="grid grid-cols-[48px_1fr_100px_180px_120px] gap-2 px-6 py-3 border-b border-white/20 bg-white/40 text-[10px] font-bold uppercase tracking-widest text-slate-400 items-center">
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={handleSelectAll}
              disabled={items.length === 0}
              title={isAllSelected ? "Unselect all" : "Select all"}
              className="inline-flex items-center justify-center rounded-lg p-1 hover:bg-black/5 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              {isAllSelected ? (
                <CheckSquare className="size-4 text-amber-500" />
              ) : (
                <Square className="size-4" />
              )}
            </button>
          </div>
          <div className="pl-2">Name</div>
          <div className="text-right pr-4">Size</div>
          <div>Last Modified</div>
          <div className="text-right pr-2">Actions</div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-sm font-semibold text-slate-400">
              Loading files...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-center text-slate-400">
              <Folder className="size-12 text-slate-300" />

              <div>
                <p className="text-sm font-bold text-slate-500">
                  This folder is empty
                </p>
                <p className="text-xs">Upload a file or create a new folder.</p>
              </div>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSelected = selectedPaths.has(item.path)
              const isFolder = item.type === "folder"

              return (
                <motion.div
                  key={item.path}
                  onClick={() => handleRowClick(item)}
                  className={`grid grid-cols-[48px_1fr_100px_180px_120px] gap-2 px-6 py-2.5 items-center border-b border-slate-50 hover:bg-slate-100/50 transition-colors group cursor-pointer select-none ${isSelected
                    ? "bg-amber-400/10 border-l-4 border-l-amber-400 pl-[21px]"
                    : "pl-6"
                    }`}
                >
                  <div className="flex items-center justify-center">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        handleToggleSelect(item)
                      }}
                      title={isSelected ? "Unselect" : "Select"}
                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${isSelected
                        ? "text-amber-500 hover:bg-amber-50"
                        : "text-slate-400 hover:text-slate-900 hover:bg-slate-200/50"
                        }`}
                    >
                      {isSelected ? (
                        <CheckSquare className="size-4" />
                      ) : (
                        <Square className="size-4" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="shrink-0">{getFileIcon(item)}</div>

                    <span className="text-sm font-semibold text-slate-700 truncate group-hover:text-slate-900 transition-colors">
                      {item.name}
                    </span>
                  </div>

                  <div className="text-[13px] text-slate-500 font-medium text-right pr-4">
                    {formatSize(item.sizeBytes)}
                  </div>

                  <div className="text-[13px] text-slate-500 font-medium truncate">
                    {formatModified(item.modifiedAt)}
                  </div>

                  <div className="flex items-center justify-end pr-2">
                    <div className="flex items-center gap-0.5 opacity-100 transition-opacity">

                      {!isFolder ? (
                        <>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              setPreviewItem(item)
                            }}
                            title="Quick Look"
                            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-200/50 rounded-lg transition-all cursor-pointer"
                          >
                            <Eye className="size-4" />
                          </button>

                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              void handleDownload(item)
                            }}
                            title="Download"
                            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-200/50 rounded-lg transition-all cursor-pointer"
                          >
                            <Download className="size-4" />
                          </button>
                        </>
                      ) : null}

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          setDeleteItems([item])
                        }}
                        title="Delete"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>

        <AnimatePresence>
          {selectedPaths.size > 0 ? (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="flex items-center gap-4 px-6 py-3 bg-white/80 backdrop-blur-2xl border border-slate-200 shadow-2xl shadow-slate-200/60 rounded-xl text-slate-900"
              >
                <span className="text-sm font-bold bg-slate-100 px-2 py-0.5 rounded-lg text-slate-600">
                  {selectedPaths.size} Selected
                </span>

                <div className="h-4 w-px bg-slate-200" />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void handleDownloadSelected()}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 rounded-lg transition-colors text-sm font-semibold cursor-pointer"
                  >
                    <Download className="size-4" />
                    Download
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors text-sm font-semibold cursor-pointer"
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaths(new Set())}
                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </motion.div>
            </div>
          ) : null}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {previewItem ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewItem(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {getFileIcon(previewItem)}

                  <div className="min-w-0">
                    <h2 className="font-bold text-zinc-900 truncate">
                      {previewItem.name}
                    </h2>
                    <p className="text-sm text-zinc-500 truncate">
                      {previewItem.path}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  className="p-1.5 rounded-lg hover:bg-black/5 text-zinc-400 hover:text-zinc-900 cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Size</span>
                  <span className="font-semibold text-zinc-900">
                    {formatSize(previewItem.sizeBytes)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-zinc-500">Modified</span>
                  <span className="font-semibold text-zinc-900">
                    {formatModified(previewItem.modifiedAt)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void handleDownload(previewItem)}
                className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-zinc-900 text-white text-sm font-bold hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <Download className="size-4" />
                Download
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isCreateFolderOpen ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCreateFolderOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-bold text-zinc-900">
                    Create new folder
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Folder will be created inside{" "}
                    <span className="font-semibold text-zinc-900">
                      {currentPath || "My Storage"}
                    </span>
                    .
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCreateFolderOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-black/5 text-zinc-400 hover:text-zinc-900 cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>

              <input
                value={newFolderName}
                onChange={(event) => setNewFolderName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    void handleCreateFolder()
                  }
                }}
                placeholder="Folder name"
                autoFocus
                className="mt-6 w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-sm font-medium text-zinc-900 outline-none focus:border-amber-400"
              />

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateFolderOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-zinc-500 hover:bg-black/5 hover:text-zinc-900 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => void handleCreateFolder()}
                  disabled={isCreatingFolder}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-zinc-900 text-white hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isCreatingFolder ? "Creating..." : "Create Folder"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {deleteItems.length > 0 ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteItems([])}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6"
            >
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                  <Trash2 className="size-5 text-red-600" />
                </div>

                <div>
                  <h2 className="font-bold text-zinc-900">Delete item?</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    This will delete{" "}
                    <span className="font-semibold text-zinc-900">
                      {deleteItems.length === 1
                        ? deleteItems[0].name
                        : `${deleteItems.length} items`}
                    </span>
                    . Folders will be deleted recursively.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteItems([])}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-zinc-500 hover:bg-black/5 hover:text-zinc-900 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => void handleDeleteConfirmed()}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
