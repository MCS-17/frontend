import { CheckCircle2, FilePlus, LayoutGrid } from "lucide-react"
import { Link } from "@tanstack/react-router"

export function SuccessStep({ onSubmitAnother }: { onSubmitAnother: () => void }) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="size-10 text-emerald-500" />
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Job submitted!</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Your job has been queued on the cluster. You can track its status from the dashboard.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onSubmitAnother}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/60 px-5 py-2.5 text-sm font-bold text-zinc-700 shadow-sm backdrop-blur-xl transition-all hover:bg-white hover:shadow-md"
          >
            <FilePlus className="size-4" />
            Submit another job
          </button>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-zinc-200 transition-all hover:bg-zinc-700"
          >
            <LayoutGrid className="size-4" />
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
