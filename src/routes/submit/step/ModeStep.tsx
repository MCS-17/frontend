import { FilePlus, Upload } from "lucide-react"
import type { Mode } from "../submit.types"

export function ModeStep({ onSelect }: { onSelect: (mode: Mode) => void }) {
  return (
    <div className="flex flex-1 items-center justify-center p-6 lg:p-10">
      <div className="w-full max-w-lg">
        <p className="text-lg text-black font-bold leading-6">
          How would you like to create your sbatch script?
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onSelect("scratch")}
            className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/60 p-6 text-left shadow-sm backdrop-blur-xl transition-all hover:border-amber-300 hover:shadow-md hover:shadow-amber-100/50"
          >
            <div className="flex size-12 items-center justify-center rounded-xl bg-amber-50 transition-colors group-hover:bg-amber-100">
              <FilePlus className="size-6 text-amber-500" />
            </div>
            <div>
              <p className="font-bold text-zinc-900">Build from scratch</p>
              <p className="mt-1 text-sm text-zinc-500">
                Fill in a form and we'll generate the script for you.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelect("upload")}
            className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/60 p-6 text-left shadow-sm backdrop-blur-xl transition-all hover:border-amber-300 hover:shadow-md hover:shadow-amber-100/50"
          >
            <div className="flex size-12 items-center justify-center rounded-xl bg-zinc-100 transition-colors group-hover:bg-zinc-200">
              <Upload className="size-6 text-zinc-500" />
            </div>
            <div>
              <p className="font-bold text-zinc-900">Upload existing script</p>
              <p className="mt-1 text-sm text-zinc-500">
                Drop a .sh or .sbatch file to parse and review it.
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}