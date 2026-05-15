import { createFileRoute } from "@tanstack/react-router"
import {
  Coins,
  Cpu,
  Loader2,
  Download,
  FileText,
  RotateCcw,
  Search,
  SlidersHorizontal,
  TerminalSquare,
  X,
} from "lucide-react"
import { useMemo, useState, useCallback, useEffect } from "react"
import { type Job, type JobStatus, type JobStatusFilter, jobsApi } from "@/lib/jobs"

export const Route = createFileRoute("/")({
  component: DashboardPage,
})

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

function formatCredits(value: number | null) {
  if (value === null)
    return "N/A"
  return new Intl.NumberFormat("en-MY").format(value)
}

function isActiveJob(job: Job) {
  return job.status === "Running" || job.status === "Pending"
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
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
 
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
 
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const loadJobs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await jobsApi.listJobs(statusFilter as JobStatusFilter, 7)
      setJobs(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    loadJobs()
  }, [loadJobs])

  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        const q = searchQuery.toLowerCase()
        return (
          job.job_name.toLowerCase().includes(q) ||
          job.job_id.toLowerCase().includes(q)
        )
      })
      .filter((job) => typeFilter === "all" || job.type === typeFilter)
  }, [jobs, searchQuery, typeFilter])

  async function openJobDetail(job: Job) {
    setSelectedJob(job)           // show modal immediately with list data
    setDetailLoading(true)
    try {
      const full = await jobsApi.getJob(job.job_id)
      setSelectedJob(full)        // upgrade with full data when ready
    } catch {
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <div className="box-border h-full overflow-hidden p-6 lg:p-10">
      <div className="mx-auto flex h-full max-w-7xl flex-col gap-6 overflow-hidden">
        <div className="shrink-0">

          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 lg:text-4xl">
            My Dashboard
          </h1>

          <p className="mt-2 max-w-full text-sm leading-6 text-zinc-500">
            View your submitted jobs, check their current status, and open each job for detailed resource information.
          </p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/30 bg-white/60 shadow-xl shadow-slate-200/50 backdrop-blur-2xl">
          <div className="shrink-0 border-b border-slate-100 px-5 py-4">
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
                      <option value="MPI">MPI</option>
                      <option value="GPU">GPU</option>
                      <option value="PYTORCH">PyTorch</option>
                      <option value="TENSORFLOW">TensorFlow</option>
                      <option value="SPARK">Spark</option>
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

          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-zinc-900 text-left text-[11px] font-bold uppercase tracking-widest text-zinc-300">
                  <th className="px-5 py-3">Job Name</th>
                  <th className="px-5 py-3">Job ID</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Submitted</th>
                  <th className="px-5 py-3">Runtime</th>
                  <th className="px-5 py-3 text-right">Credits</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center">
                      <div className="flex items-center justify-center gap-2 text-sm font-semibold text-zinc-400">
                        <Loader2 className="size-4 animate-spin" />
                        Loading jobs…
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center">
                      <p className="text-sm font-semibold text-red-500">{error}</p>
                      <button onClick={loadJobs} className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-zinc-600 hover:bg-slate-50">
                        <RotateCcw className="size-3.5" /> Retry
                      </button>
                    </td>
                  </tr>
                ) : filteredJobs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-12 text-center text-sm font-semibold text-zinc-400"
                    >
                      No jobs match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job, index) => (
                    <tr
                      key={job.job_id}
                      onClick={() => openJobDetail(job)}
                      className={`cursor-pointer border-b border-slate-100 text-sm transition-colors hover:bg-amber-50/50 ${
                        index % 2 === 0 ? "bg-white/70" : "bg-slate-50/70"
                      }`}
                    >
                      <td className="whitespace-nowrap px-5 py-3 font-bold text-zinc-800">
                        {job.job_name}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-zinc-500">
                          {job.job_id}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-xs font-bold uppercase tracking-wide text-zinc-500">
                        {job.type}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3">
                        <JobStatusBadge status={job.status} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-xs font-medium text-zinc-500">
                        {job.submitted}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-xs font-medium text-zinc-500">
                        {job.runtime || (job.status === "Pending" ? "Queued" : "—")}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-right text-xs font-bold text-amber-700">
                        <span className="inline-flex items-center justify-end gap-1.5 rounded-lg bg-amber-50 px-2 py-1">
                          <Coins className="size-3.5" />
                          { formatCredits(job.credits) }
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            title="Preview output"
                            onClick={(event) => {
                              event.stopPropagation()
                              // TODO: wire up output preview endpoint
                            }}
                            className="rounded-lg p-1.5 text-zinc-400 transition-all hover:bg-slate-100 hover:text-zinc-900"
                          >
                            <FileText className="size-4" />
                          </button>

                          {!isActiveJob(job) ? (
                            <button
                              type="button"
                              title="Download output"
                              onClick={(event) => event.stopPropagation()}
                              className="rounded-lg p-1.5 text-zinc-400 transition-all hover:bg-slate-100 hover:text-zinc-900"
                            >
                              <Download className="size-4" />
                            </button>
                          ) : null}

                          {job.status === "Completed" ? (
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

          <div className="flex shrink-0 flex-col gap-3 border-t border-slate-100 px-5 py-3 text-xs font-semibold text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
            <span>{filteredJobs.length} jobs shown</span>
            <span>{jobs.length} records total</span>
          </div>
        </div>
      </div>

      {selectedJob ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6 backdrop-blur-sm"
          onClick={() => setSelectedJob(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 text-white">
                  { detailLoading
                    ? <Loader2 className="size-5 animate-spin" />
                    : <TerminalSquare className="size-5" />}
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-lg font-bold text-zinc-900">
                    {selectedJob.job_name}
                  </h2>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-500">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono">
                      {selectedJob.job_id}
                    </span>
                    <span>{selectedJob.type.toUpperCase()}</span>
                    <span>Submitted {selectedJob.submitted}</span>
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
                { label: "Submitted", value: selectedJob.submitted },
                {
                  label: "Completed",
                  value: selectedJob.end ? selectedJob.end : "—",
                },
                {
                  label: "Credits Used",
                  value: `${formatCredits(selectedJob.credits)} credits`,
                  highlight: true,
                },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className={`rounded-2xl border p-4 ${
                    metric.highlight
                      ? "border-amber-100 bg-amber-50/80"
                      : "border-slate-100 bg-slate-50/80"
                  }`}
                >
                  <div
                    className={`text-xs font-semibold ${
                      metric.highlight ? "text-amber-600" : "text-zinc-400"
                    }`}
                  >
                    {metric.label}
                  </div>
                  <div
                    className={`mt-1 text-sm font-bold ${
                      metric.highlight ? "text-amber-800" : "text-zinc-800"
                    }`}
                  >
                    {metric.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 px-6 py-5">
              <h3 className="text-sm font-bold text-zinc-900">Job actions</h3>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                      // TODO: wire up output preview endpoint
                    }
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-zinc-600 transition-all hover:bg-slate-50 hover:text-zinc-900"
                >
                  <FileText className="size-4" />
                  Preview output
                </button>

                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-zinc-600 transition-all hover:bg-slate-50 hover:text-zinc-900"
                >
                  <Download className="size-4" />
                  Download output
                </button>

                {selectedJob.status === "Completed" ? (
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
