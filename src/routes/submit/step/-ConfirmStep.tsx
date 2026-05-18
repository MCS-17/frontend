import { ArrowLeft, SendHorizontal, TerminalSquare, FileCode } from "lucide-react"
import type { UploadedFile } from "../-submit.types"

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

export function ConfirmStep({
  script,
  uploadedFiles,
  onBack,
  onSubmit,
  isSubmitting,
}: {
  script: string
  uploadedFiles: UploadedFile[]
  onBack: () => void
  onSubmit: () => void
  isSubmitting: boolean
}) {
  const lines = script.split("\n")

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/30 bg-white/60 shadow-xl shadow-slate-200/50 backdrop-blur-2xl">

      {/* Header */}
      <div className="shrink-0 border-b border-slate-100 px-6 py-4">
        <h2 className="text-lg font-bold text-zinc-900">Review your script</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Check everything looks right before submitting to the cluster.
        </p>
      </div>

      {/* Replace the current stacked layout with this */}
      <div className="flex min-h-0 flex-1 overflow-hidden">

        {/* Left — input files (only if any) */}
        {uploadedFiles.length > 0 && (
          <div className="flex w-1/6 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950">
            <div className="shrink-0 border-b border-zinc-800 px-3 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Input files ({uploadedFiles.length})
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <div className="flex flex-col gap-1.5">
                {uploadedFiles.map((f) => (
                  <div key={f.path} className="flex flex-col gap-0.5 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-2">
                    <div className="flex items-center gap-1.5">
                      <FileCode className="size-3 shrink-0 text-zinc-500" />
                      <span className="truncate font-mono text-[11px] font-semibold text-zinc-300">{f.name}</span>
                    </div>
                    <span className="font-mono text-[10px] text-zinc-600">{f.path}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Right — script preview */}
        <div className="flex min-h-0 flex-1 flex-col bg-zinc-950">
          <div className="flex shrink-0 items-center gap-2 border-b border-zinc-800 px-4 py-3">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-zinc-800">
              <TerminalSquare className="size-3.5 text-zinc-400" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">sbatch script</span>
            <span className="ml-auto rounded-md border border-zinc-700 px-2 py-0.5 text-[10px] font-bold text-zinc-500">
              read-only
            </span>
          </div>
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
        </div>

      </div>

      {/* Action bar */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-t border-slate-100 px-5 py-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-zinc-500 transition-all hover:bg-slate-50 hover:text-zinc-800"
        >
          <ArrowLeft className="size-3.5" />
          Edit
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-zinc-200 transition-all hover:bg-zinc-700 disabled:opacity-60"
        >
          {isSubmitting ? (
            <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <SendHorizontal className="size-4" />
          )}
          {isSubmitting ? "Submitting…" : "Submit job"}
        </button>
      </div>
    </div>
  )
}
