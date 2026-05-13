import { createFileRoute } from "@tanstack/react-router"
import {
  CheckCircle2,
  Clock,
  Cpu,
  Download,
  Eye,
  RotateCcw,
  Search,
  SlidersHorizontal,
  TerminalSquare,
  X,
} from "lucide-react"
import { useMemo, useState } from "react"

export const Route = createFileRoute("/")({
  component: DashboardPage,
})

type JobStatus = "running" | "pending" | "completed" | "failed" | "cancelled"
type JobType = "mpi" | "gpu" | "pytorch" | "tensorflow" | "spark"

type Job = {
  id: string
  name: string
  type: JobType
  status: JobStatus
  submittedAt: Date
  completedAt?: Date
  runtime?: string
  nodes: number
  cpus: number
  gpus: number
  memory: string
}

const mockJobs: Job[] = [
  {
    id: "JOB-1042",
    name: "protein-folding-gpu-test",
    type: "gpu",
    status: "running",
    submittedAt: new Date(Date.now() - 1000 * 60 * 42),
    runtime: "42m 18s",
    nodes: 1,
    cpus: 8,
    gpus: 1,
    memory: "32 GB",
  },
  {
    id: "JOB-1041",
    name: "mpi-matrix-benchmark",
    type: "mpi",
    status: "running",
    submittedAt: new Date(Date.now() - 1000 * 60 * 76),
    runtime: "1h 16m",
    nodes: 3,
    cpus: 24,
    gpus: 0,
    memory: "48 GB",
  },
  {
    id: "JOB-1040",
    name: "spark-event-pipeline",
    type: "spark",
    status: "pending",
    submittedAt: new Date(Date.now() - 1000 * 60 * 11),
    nodes: 2,
    cpus: 16,
    gpus: 0,
    memory: "24 GB",
  },
  {
    id: "JOB-1039",
    name: "pytorch-cuda-validation",
    type: "pytorch",
    status: "completed",
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    runtime: "2h 02m",
    nodes: 1,
    cpus: 8,
    gpus: 1,
    memory: "32 GB",
  },
  {
    id: "JOB-1038",
    name: "tensorflow-smoke-test",
    type: "tensorflow",
    status: "failed",
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 7),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
    runtime: "48m 09s",
    nodes: 1,
    cpus: 6,
    gpus: 1,
    memory: "24 GB",
  },
  {
    id: "JOB-1037",
    name: "openmpi-latency-check",
    type: "mpi",
    status: "cancelled",
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 11),
    runtime: "31m 44s",
    nodes: 2,
    cpus: 12,
    gpus: 0,
    memory: "16 GB",
  },
]

const statusTabs = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Failed", value: "failed" },
  { label: "Cancelled", value: "cancelled" },
]

function getStatusStyle(status: string) {
  if (["running", "completed"].includes(status)) {
    return "border-emerald-100 bg-emerald-50 text-emerald-700"
  }

  if (status === "pending") {
    return "border-amber-100 bg-amber-50 text-amber-700"
  }

  if (["failed", "cancelled"].includes(status)) {
    return "border-red-100 bg-red-50 text-red-700"
  }

  return "border-slate-100 bg-slate-50 text-slate-600"
}

function getStatusDot(status: string) {
  if (["running", "completed"].includes(status)) {
    return "bg-emerald-500"
  }

  if (status === "pending") {
    return "bg-amber-500"
  }

  if (["failed", "cancelled"].includes(status)) {
    return "bg-red-500"
  }

  return "bg-slate-400"
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-MY", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function formatTimeAgo(date: Date) {
  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000))

  if (diffMinutes < 60) return `${diffMinutes}m ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

function isActiveJob(job: Job) {
  return job.status === "running" || job.status === "pending"
}

function JobStatusBadge({ status }: { status: JobStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${getStatusStyle(
        status,
      )}`}
    >
      <span className={`size-1.5 rounded-full ${getStatusDot(status)}`} />
      {status}
    </span>
  )
}

function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  const filteredJobs = useMemo(() => {
    return mockJobs
      .filter(
        (job) =>
          job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.id.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .filter((job) => {
        if (statusFilter === "all") return true
        if (statusFilter === "active") return isActiveJob(job)
        return job.status === statusFilter
      })
      .filter((job) => typeFilter === "all" || job.type === typeFilter)
  }, [searchQuery, statusFilter, typeFilter])

  return (
    <div className="min-h-full p-6 lg:p-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/60 px-3 py-1 text-xs font-bold uppercase tracking-widest text-zinc-500 shadow-sm backdrop-blur-xl">
              <Cpu className="size-3.5 text-amber-500" />
              MONHPC Dashboard
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 lg:text-4xl">
              My Jobs
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              View your submitted jobs, check their current status, and open each job for detailed resource information.
            </p>
          </div>

        </div>

        <div className="overflow-hidden rounded-3xl border border-white/30 bg-white/60 shadow-xl shadow-slate-200/50 backdrop-blur-2xl">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <p className="text-sm text-zinc-500">
                Click any job row to view its full details.
              </p>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search jobs..."
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white/70 pl-9 pr-3 text-sm font-medium text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-amber-400 sm:w-56"
                  />
                </div>

                <div className="flex gap-2">
                  <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-3 text-zinc-400">
                    <SlidersHorizontal className="size-4" />
                    <select
                      value={typeFilter}
                      onChange={(event) => setTypeFilter(event.target.value)}
                      className="bg-transparent text-sm font-semibold text-zinc-600 outline-none"
                    >
                      <option value="all">All types</option>
                      <option value="mpi">MPI</option>
                      <option value="gpu">GPU</option>
                      <option value="pytorch">PyTorch</option>
                      <option value="tensorflow">TensorFlow</option>
                      <option value="spark">Spark</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {statusTabs.map((tab) => {
                const isActive = statusFilter === tab.value

                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setStatusFilter(tab.value)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                      isActive
                        ? "bg-zinc-900 text-white shadow-lg shadow-zinc-200"
                        : "border border-slate-200 bg-white/60 text-zinc-500 hover:bg-white hover:text-zinc-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-zinc-900 text-left text-[11px] font-bold uppercase tracking-widest text-zinc-300">
                  <th className="px-5 py-3">Job Name</th>
                  <th className="px-5 py-3">Job ID</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Submitted</th>
                  <th className="px-5 py-3">Runtime</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-sm font-semibold text-zinc-400"
                    >
                      No jobs match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job, index) => (
                    <tr
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className={`cursor-pointer border-b border-slate-100 text-sm transition-colors hover:bg-amber-50/50 ${
                        index % 2 === 0 ? "bg-white/70" : "bg-slate-50/70"
                      }`}
                    >
                      <td className="whitespace-nowrap px-5 py-3 font-bold text-zinc-800">
                        {job.name}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-zinc-500">
                          {job.id}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-xs font-bold uppercase tracking-wide text-zinc-500">
                        {job.type}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3">
                        <JobStatusBadge status={job.status} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-xs font-medium text-zinc-500">
                        {formatDate(job.submittedAt)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-xs font-medium text-zinc-500">
                        {job.runtime || (job.status === "pending" ? "Queued" : "—")}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            title="View details"
                            onClick={(event) => {
                              event.stopPropagation()
                              setSelectedJob(job)
                            }}
                            className="rounded-lg p-1.5 text-zinc-400 transition-all hover:bg-slate-100 hover:text-zinc-900"
                          >
                            <Eye className="size-4" />
                          </button>

                          {!isActiveJob(job) ? (
                            <button
                              type="button"
                              title="Download"
                              onClick={(event) => event.stopPropagation()}
                              className="rounded-lg p-1.5 text-zinc-400 transition-all hover:bg-slate-100 hover:text-zinc-900"
                            >
                              <Download className="size-4" />
                            </button>
                          ) : null}

                          {job.status === "completed" ? (
                            <button
                              type="button"
                              title="Resubmit"
                              onClick={(event) => event.stopPropagation()}
                              className="rounded-lg p-1.5 text-zinc-400 transition-all hover:bg-slate-100 hover:text-zinc-900"
                            >
                              <RotateCcw className="size-4" />
                            </button>
                          ) : null}

                          {isActiveJob(job) ? (
                            <button
                              type="button"
                              title="Cancel"
                              onClick={(event) => event.stopPropagation()}
                              className="rounded-lg p-1.5 text-red-400 transition-all hover:bg-red-50 hover:text-red-600"
                            >
                              <X className="size-4" />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-3 text-xs font-semibold text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
            <span>{filteredJobs.length} jobs shown</span>
            <span>{mockJobs.length} records total</span>
          </div>
        </div>
      </div>

      {selectedJob ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6 backdrop-blur-sm"
          onClick={() => setSelectedJob(null)}
        >
          <div
            className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 text-white">
                  <TerminalSquare className="size-5" />
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-lg font-bold text-zinc-900">
                    {selectedJob.name}
                  </h2>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-500">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono">
                      {selectedJob.id}
                    </span>
                    <span>{selectedJob.type.toUpperCase()}</span>
                    <span>Submitted {formatTimeAgo(selectedJob.submittedAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <JobStatusBadge status={selectedJob.status} />

                <button
                  type="button"
                  onClick={() => setSelectedJob(null)}
                  className="rounded-xl p-2 text-zinc-400 transition-all hover:bg-slate-100 hover:text-zinc-900"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 px-6 py-5 md:grid-cols-4">
              {[
                { label: "Nodes", value: selectedJob.nodes },
                { label: "CPUs", value: selectedJob.cpus },
                { label: "GPUs", value: selectedJob.gpus },
                { label: "Memory", value: selectedJob.memory },
                { label: "Runtime", value: selectedJob.runtime || "Queued" },
                { label: "Submitted", value: formatDate(selectedJob.submittedAt) },
                {
                  label: "Completed",
                  value: selectedJob.completedAt ? formatDate(selectedJob.completedAt) : "—",
                },
                {
                  label: "Queue",
                  value: selectedJob.status === "pending" ? "Waiting" : "Normal",
                },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4"
                >
                  <div className="text-xs font-semibold text-zinc-400">{metric.label}</div>
                  <div className="mt-1 text-sm font-bold text-zinc-800">{metric.value}</div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 px-6 py-5">
              <h3 className="text-sm font-bold text-zinc-900">Job actions</h3>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-zinc-600 transition-all hover:bg-slate-50 hover:text-zinc-900"
                >
                  <Download className="size-4" />
                  Download output
                </button>

                {selectedJob.status === "completed" ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-zinc-600 transition-all hover:bg-slate-50 hover:text-zinc-900"
                  >
                    <RotateCcw className="size-4" />
                    Resubmit job
                  </button>
                ) : null}

                {isActiveJob(selectedJob) ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition-all hover:bg-red-100"
                  >
                    <X className="size-4" />
                    Cancel job
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
