import {
  FilePlus,
  Upload,
  TerminalSquare,
  Copy,
  Check,
  RotateCcw,
  SendHorizontal,
  X,
  FileCode,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react"
import { useState, useRef, useCallback, useEffect } from "react"
import {
  FIELD_CONFIG,
  DEFAULTS,
  buildScript,
  parseScript,
  type FormFields,
  type PartialFields,
  type Mode,
  type UploadedFile,
} from "../submit.types"

// ── Syntax-highlighted script line ───────────────────────────────────────────
function ScriptLine({ line }: { line: string }) {
  if (line.startsWith("#!/")) return <span className="text-violet-400">{line}</span>

  if (line.startsWith("#SBATCH")) {
    const eq = line.indexOf("=")
    if (eq !== -1) {
      return (
        <span>
          <span className="text-amber-400">{line.slice(0, eq)}</span>
          <span className="text-zinc-500">=</span>
          <span className="text-emerald-400">{line.slice(eq + 1)}</span>
        </span>
      )
    }
    return <span className="text-amber-400">{line}</span>
  }

  if (line.startsWith("#")) return <span className="text-zinc-600">{line}</span>
  if (line === "") return <span>&nbsp;</span>
  return <span className="text-zinc-300">{line}</span>
}

// ── Script preview panel ─────────────────────────────────────────────────────
function ScriptPreview({
  script,
  editable,
  onChange,
}: {
  script: string
  editable: boolean
  onChange?: (val: string) => void
}) {
  const lines = script.split("\n")
  const lineCount = lines.length

  if (!editable) {
    return (
      <div className="min-h-0 flex-1 overflow-auto p-4">
        <pre className="font-mono text-xs leading-5">
          {lines.map((line, i) => (
            <div key={i} className="flex hover:bg-zinc-800/50">
              <span className="w-9 shrink-0 select-none pr-3 text-right text-zinc-600">{i + 1}</span>
              <ScriptLine line={line} />
            </div>
          ))}
        </pre>
      </div>
    )
  }

  return (
    <div className="min-h-0 flex-1 overflow-auto p-4">
      <div className="flex">
        {/* Line numbers */}
        <div className="w-9 shrink-0 select-none pr-3 text-right font-mono text-xs leading-5 text-zinc-600">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        {/* Textarea — no contentEditable fighting the browser */}
        <textarea
          value={script}
          onChange={(e) => onChange?.(e.target.value)}
          spellCheck={false}
          className="min-w-0 flex-1 resize-none whitespace-pre bg-transparent font-mono text-xs leading-5 text-zinc-300 outline-none"
          rows={Math.max(lineCount, 16)}
        />
      </div>
    </div>
  )
}

// ── Field group wrapper ───────────────────────────────────────────────────────
function FieldGroup({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-xs font-bold text-zinc-500">{label}</label>
        {hint && <span className="text-[11px] text-zinc-400">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

const inputCls =
  "h-9 w-full rounded-xl border border-slate-200 bg-white/70 px-3 text-sm font-medium text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-amber-400"

// ── Config-driven field renderer ──────────────────────────────────────────────
function FieldsRenderer({ fields, onChange }: { fields: FormFields; onChange: (patch: PartialFields) => void }) {
  const sections = FIELD_CONFIG.reduce<{ name: string; fields: typeof FIELD_CONFIG }[]>(
    (acc, cfg) => {
      const existing = acc.find((s) => s.name === cfg.section)
      if (existing) existing.fields.push(cfg)
      else acc.push({ name: cfg.section, fields: [cfg] })
      return acc
    },
    [],
  )

  return (
    <>
      {sections.map((section) => (
        <div key={section.name}>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-zinc-400">{section.name}</p>
          <div className="grid grid-cols-2 gap-3">
            {section.fields.map((cfg) => (
              <div key={cfg.key} className={cfg.colSpan === 2 ? "col-span-2" : "col-span-1"}>
                <FieldGroup label={cfg.label} hint={cfg.hint}>
                  {cfg.type === "textarea" ? (
                    <textarea
                      className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 font-mono text-xs font-medium text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-amber-400"
                      rows={6}
                      value={fields[cfg.key] ?? cfg.default}
                      placeholder={cfg.placeholder}
                      onChange={(e) => onChange({ [cfg.key]: e.target.value })}
                    />
                  ) : (
                    <input
                      type={cfg.type}
                      min={cfg.type === "number" ? 0 : undefined}
                      className={inputCls}
                      value={fields[cfg.key] ?? cfg.default}
                      placeholder={cfg.placeholder}
                      onChange={(e) => onChange({ [cfg.key]: e.target.value })}
                    />
                  )}
                </FieldGroup>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  )
}

// ── Files panel ───────────────────────────────────────────────────────────────
function FilesPanel({
  files,
  onAdd,
  onRemove,
}: {
  files: UploadedFile[]
  onAdd: (file: UploadedFile) => void
  onRemove: (path: string) => void
}) {
  const [copiedPath, setCopiedPath] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (fileList: FileList) => {
    Array.from(fileList).forEach((f) => {
      onAdd({ name: f.name, size: f.size, path: `./${f.name}`, file: f })
    })
  }

  const handleCopy = async (path: string) => {
    await navigator.clipboard.writeText(path)
    setCopiedPath(path)
    setTimeout(() => setCopiedPath(null), 1500)
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div>
      <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-zinc-400">Input files</p>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => { if (e.target.files) handleFiles(e.target.files) }}
      />

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 px-3 py-2.5 text-xs font-bold text-zinc-400 transition-all hover:border-amber-300 hover:bg-amber-50/30 hover:text-zinc-600"
        >
          <Upload className="size-3.5" />
          Add input file
        </button>

        {files.map((f) => (
          <div
            key={f.path}
            onClick={() => handleCopy(f.path)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-3 py-2"
          >
            <FileCode className="size-4 shrink-0 text-zinc-400" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-xs font-semibold text-zinc-700">{f.name}</p>
              <p className="truncate font-mono text-[10px] text-zinc-400">{f.path}</p>
            </div>
            <span className="shrink-0 text-[10px] text-zinc-400">{formatSize(f.size)}</span>
            <button
              type="button"
              onClick={() => handleCopy(f.path)}
              className="shrink-0 rounded-lg p-1.5 text-zinc-400 transition-all hover:bg-slate-100 hover:text-zinc-700"
              title="Copy path"
            >
              {copiedPath === f.path
                ? <Check className="size-3.5 text-emerald-500" />
                : <Copy className="size-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => onRemove(f.path)}
              className="shrink-0 rounded-lg p-1.5 text-zinc-400 transition-all hover:bg-slate-100 hover:text-zinc-700"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Scratch panel ─────────────────────────────────────────────────────────────
function ScratchPanel({
  mode,
  fields,
  onChange,
  onParsed,
  uploadedFiles,
  onAddFile,
  onRemoveFile,
}: {
  mode: Mode
  fields: FormFields
  onChange: (patch: PartialFields) => void
  onParsed: (script: string, fields: FormFields) => void
  uploadedFiles: UploadedFile[]
  onAddFile: (file: UploadedFile) => void
  onRemoveFile: (path: string) => void
}) {
  const [fileName, setFileName] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setFileName(file.name)
      const parsed = parseScript(text)
      const merged: FormFields = { ...DEFAULTS, ...parsed }
      onParsed(text, merged)
    }
    reader.readAsText(file)
  }, [onParsed])

  return (
    <div className="flex flex-col gap-5 p-5">
      {/* Upload picker — only shown in upload mode */}
      {mode === "upload" && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept=".sh,.sbatch,.bash"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f) }}
          />
          {!fileName ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) processFile(f) }}
              className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all ${isDragging ? "border-amber-400 bg-amber-50/50" : "border-slate-200 hover:border-amber-300 hover:bg-amber-50/30"
                }`}
            >
              <div className="flex size-12 items-center justify-center rounded-2xl bg-zinc-100">
                <Upload className="size-5 text-zinc-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-700">Drop your script here</p>
                <p className="mt-1 text-xs text-zinc-400">.sh, .sbatch or .bash — or click to browse</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                <FileCode className="size-4 text-amber-600" />
              </div>
              <span className="flex-1 truncate font-mono text-xs font-semibold text-zinc-700">{fileName}</span>
              <div className="flex items-center gap-1 rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-1">
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                <p className="text-xs font-semibold text-emerald-700">Parsed</p>
              </div>
              <button
                type="button"
                onClick={() => { setFileName(null); onParsed("", {} as FormFields) }}
                className="rounded-lg p-1 text-zinc-400 transition-all hover:bg-slate-100 hover:text-zinc-700"
              >
                <X className="size-3.5" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Same fields form for both modes */}
      <FieldsRenderer fields={fields} onChange={onChange} />
      <FilesPanel files={uploadedFiles} onAdd={onAddFile} onRemove={onRemoveFile} />
    </div>
  )
}

// ── Editor step ───────────────────────────────────────────────────────────────
export function EditorStep({
  mode,
  fields,
  script,
  onFieldChange,
  onScriptEdit,
  onParsed,
  onBack,
  onNext,
  onReset,
  uploadedFiles,
  setUploadedFiles,
}: {
  mode: Mode
  fields: FormFields
  script: string
  onFieldChange: (patch: PartialFields) => void
  onScriptEdit: (raw: string) => void
  onParsed: (script: string, fields: FormFields) => void
  onBack: () => void
  onNext: () => void
  onReset: () => void
  uploadedFiles: UploadedFile[]
  setUploadedFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(script)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleAddFile = (file: UploadedFile) => {
    setUploadedFiles((prev: any) =>
      prev.find((f: any) => f.path === file.path) ? prev : [...prev, file]
    )
  }

  const handleRemoveFile = (path: string) => {
    setUploadedFiles((prev: any) => prev.filter((f: any) => f.path !== path))
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/30 bg-white/60 shadow-xl shadow-slate-200/50 backdrop-blur-2xl">

      {/* Mode label bar */}
      <div className="flex shrink-0 items-center gap-3 border-b border-slate-100 px-5 py-3">
        <div className="flex items-center gap-2">
          {mode === "scratch" ? <FilePlus className="size-4 text-amber-500" /> : <Upload className="size-4 text-zinc-400" />}
          <span className="text-sm font-bold text-zinc-700">
            {mode === "scratch" ? "Build from scratch" : "Upload existing script"}
          </span>
        </div>
      </div>

      {/* Split layout */}
      <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-2">
        {/* Left — fields */}
        <div className="min-h-0 overflow-y-auto border-b border-slate-100 lg:border-b-0 lg:border-r">
          <ScratchPanel
            mode={mode}
            fields={fields}
            onChange={onFieldChange}
            onParsed={onParsed}
            uploadedFiles={uploadedFiles}
            onAddFile={handleAddFile}
            onRemoveFile={handleRemoveFile}
          />
        </div>

        {/* Right — script preview */}
        <div className="flex min-h-0 flex-col bg-zinc-950">
          <div className="flex shrink-0 items-center gap-2 border-b border-zinc-800 px-4 py-3">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-zinc-800">
              <TerminalSquare className="size-3.5 text-zinc-400" />
            </div>
            <span className="flex-1 text-xs font-bold uppercase tracking-widest text-zinc-500">sbatch preview</span>
            {mode === "scratch" && (
              <span className="rounded-md border border-zinc-700 px-2 py-0.5 text-[10px] font-bold text-zinc-500">editable</span>
            )}
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-2.5 py-1.5 text-xs font-bold text-zinc-400 transition-all hover:bg-zinc-800 hover:text-zinc-200"
            >
              {copied ? (
                <><Check className="size-3.5 text-emerald-400" /><span className="text-emerald-400">Copied</span></>
              ) : (
                <><Copy className="size-3.5" />Copy</>
              )}
            </button>
          </div>

          {script ? (
            <ScriptPreview script={script} editable={mode === "scratch"} onChange={onScriptEdit} />
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm font-semibold text-zinc-600">
              Upload a script to preview it here
            </div>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-t border-slate-100 px-5 py-3">
        {/* Left */}
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-zinc-500 transition-all hover:bg-slate-50 hover:text-zinc-800"
        >
          <ArrowLeft className="size-3.5" />
          Back
        </button>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-zinc-500 transition-all hover:bg-slate-50 hover:text-zinc-800"
          >
            <RotateCcw className="size-3.5" />
            Reset
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!script}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-zinc-200 transition-all hover:bg-zinc-700 disabled:opacity-40"
          >
            <SendHorizontal className="size-4" />
            Review & submit
          </button>
        </div>
      </div>
    </div>
  )
}