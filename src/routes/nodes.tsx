import { createFileRoute } from "@tanstack/react-router"
import {
  Server,
  Cpu,
  HardDrive,
  Activity,
  X,
  Thermometer,
  Clock,
  AlertCircle,
  Zap,
  CircuitBoard,
  RefreshCw
} from "lucide-react"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "motion/react"
import { nodesApi } from "../lib/nodes"

export const Route = createFileRoute("/nodes")({
  component: NodesDashboardPage,
})

// --- HELPER COMPONENT FOR STATUS STYLES ---
function getStatusStyle(status: "Online" | "Offline") {
  if (status === "Online") return "border-emerald-200 bg-emerald-50 text-emerald-700"
  return "border-red-200 bg-red-50 text-red-700"
}

function getStatusDot(status: "Online" | "Offline") {
  if (status === "Online") return "bg-emerald-500"
  return "bg-red-500"
}

// --- LIGHT CONTRAST PROGRESS BAR COMPONENT ---
function ProgressBar({ value, colorClass }: { value: number; colorClass?: string }) {
  const safeValue = Math.min(Math.max(value, 0), 100)
  const isHigh = safeValue > 85
  const barColor = colorClass || (isHigh ? "bg-red-500" : "bg-emerald-500")

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className={`h-full transition-all duration-500 ${barColor}`}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  )
}

export function NodesDashboardPage() {
  // Store just the selected node's ID to fetch fresh real-time details reactively
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  // 1. Fetch Summary Data for the High-Level Grid (polls every 10 seconds)
  const { 
    data: nodesSummary, 
    isLoading: isSummaryLoading, 
    isError,
    refetch: refetchSummary,       // <-- Extracted for global sync button
    isFetching: isSummaryFetching  // <-- Extracted to animate global button spinner
  } = useQuery({
    queryKey: ["nodes-summary"],
    queryFn: nodesApi.listNodesSummary,
    refetchInterval: 10000,
  })

  // 2. Fetch Isolated Node Hardware Specs for the Modal (polls every 5 seconds while open)
  const { 
    data: nodeDetail, 
    isLoading: isDetailLoading,
    refetch: refetchDetail,        
    isFetching: isDetailFetching,  
    dataUpdatedAt: detailUpdatedAt 
  } = useQuery({
    queryKey: ["node-details", selectedNodeId],
    queryFn: () => nodesApi.getNodeDetails(selectedNodeId!),
    enabled: !!selectedNodeId,
    refetchInterval: 5000,
  })

  function closeModal() {
    setSelectedNodeId(null)
  }

  // Handle high-level initial page loading state matching Storage look
  if (isSummaryLoading) {
    return (
      <div className="p-6 lg:p-10 flex h-full flex-col items-center justify-center text-slate-400">
        <RefreshCw className="size-8 animate-spin text-slate-400" />
        <span className="mt-2 text-sm font-semibold">Loading cluster status...</span>
      </div>
    )
  }

  // Handle global error status
  if (isError) {
    return (
      <div className="p-6 lg:p-10 flex h-full flex-col items-center justify-center gap-3 text-slate-400">
        <AlertCircle className="size-12 text-red-500" />
        <div>
          <p className="text-sm font-bold text-slate-700">Failed to load infrastructure data</p>
          <p className="text-xs text-slate-500">Please check cluster API availability connectivity.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-10 flex flex-col h-full gap-6 relative text-zinc-900">
      
      {/* Header aligned with global layout theme */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Cluster Status
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Real-time telemetry and availability for cluster worker nodes. Click a card to view specific accelerator specs.
          </p>
        </div>

        {/* NEW Global Grid Refresh Action Control Button */}
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={() => void refetchSummary()}
            disabled={isSummaryFetching}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 cursor-pointer shadow-sm select-none"
          >
            <RefreshCw className={`size-3.5 text-slate-500 ${isSummaryFetching ? "animate-spin" : ""}`} />
            <span>{isSummaryFetching ? "Syncing Grid..." : "Refresh Status"}</span>
          </button>
        </div>
      </div>

      {/* Nodes Grid using glass panels from the Storage color scheme */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {nodesSummary?.map((node) => {
          const memoryPercent = node.memoryTotal > 0 ? (node.memoryUsed / node.memoryTotal) * 100 : 0

          return (
            <div
              key={node.id}
              onClick={() => setSelectedNodeId(node.id)}
              className="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-white/20 bg-white/50 p-5 shadow-xl shadow-slate-200/50 backdrop-blur-2xl transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white select-none"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-slate-700 shadow-sm">
                    <Server className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                      {node.name}
                    </h3>
                    <div className="text-xs font-medium text-slate-400 font-mono">
                      {node.id}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${getStatusStyle(
                    node.status
                  )}`}
                >
                  <span className={`size-1.5 rounded-full ${getStatusDot(node.status)}`} />
                  {node.status}
                </span>
                <div className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                  <Clock className="size-3.5" />
                  {node.uptime}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4">
                {/* CPU Overview */}
                <div>
                  <div className="mb-1.5 flex justify-between text-xs font-bold text-slate-600">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Cpu className="size-3.5" /> CPU Load
                    </span>
                    <span>{node.cpuUsage}%</span>
                  </div>
                  <ProgressBar value={node.cpuUsage} />
                </div>

                {/* RAM Overview */}
                <div>
                  <div className="mb-1.5 flex justify-between text-xs font-bold text-slate-600">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <HardDrive className="size-3.5" /> Memory
                    </span>
                    <span>{Math.round(memoryPercent)}%</span>
                  </div>
                  <ProgressBar value={memoryPercent} />
                </div>

                {/* GPU Overview */}
                <div>
                  <div className="mb-1.5 flex justify-between text-xs font-bold text-slate-600">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <CircuitBoard className="size-3.5" /> Avg GPU
                    </span>
                    <span>{Math.round(node.avgGpuUsage)}%</span>
                  </div>
                  <ProgressBar value={node.avgGpuUsage} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* NODE DETAIL MODAL WITH LIGHT TRANSITION MATCHING FILE PREVIEWS */}
      <AnimatePresence>
        {selectedNodeId && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl lg:grid lg:grid-cols-12 text-zinc-900 border border-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              {isDetailLoading || !nodeDetail ? (
                <div className="col-span-12 flex flex-col items-center justify-center h-full gap-3 p-12 text-slate-400">
                  <RefreshCw className="size-8 animate-spin text-slate-400" />
                  <p className="text-sm font-semibold">Fetching real-time node telemetry...</p>
                </div>
              ) : (
                <>
                  {/* LEFT PANEL — Specs & Fixed Attributes */}
                  <div className="flex flex-col border-b border-slate-100 bg-slate-50/50 lg:col-span-4 lg:border-b-0 lg:border-r">
                    <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 shadow-sm">
                          <Server className="size-6" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-zinc-900">{nodeDetail.name}</h2>
                          <span className="mt-1 inline-block rounded bg-slate-200/60 px-2 py-0.5 font-mono text-xs font-semibold text-slate-600">
                            {nodeDetail.id}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={closeModal}
                        className="rounded-xl p-2 text-slate-400 transition-all hover:bg-slate-200 hover:text-zinc-900 lg:hidden"
                      >
                        <X className="size-5" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      <div className="mb-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Status</p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className={`size-2.5 rounded-full ${getStatusDot(nodeDetail.status)}`} />
                            <span className="font-bold text-slate-700">{nodeDetail.status}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Uptime</p>
                          <p className="mt-1 font-bold text-slate-700">{nodeDetail.uptime}</p>
                        </div>
                      </div>

                      <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Host Specifications</p>
                      
                      <div className="space-y-3">
                        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                          <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                            <Cpu className="size-4 text-slate-400" /> Processor
                          </div>
                          <div className="mt-2 text-xs font-medium text-slate-500 leading-relaxed">
                            <span className="text-slate-800 font-semibold">{nodeDetail.cpuModel}</span>
                            <br />
                            {nodeDetail.cpuCores} Cores Total
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                          <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                            <HardDrive className="size-4 text-slate-400" /> System Memory
                          </div>
                          <div className="mt-2 text-xs font-medium text-slate-500">
                            <span className="font-bold text-slate-800">{nodeDetail.memoryTotal} GB</span> RAM Total
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                          <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                            <CircuitBoard className="size-4 text-slate-400" /> Accelerators
                          </div>
                          <div className="mt-2 text-xs font-medium text-slate-500">
                            {nodeDetail.gpus.length}x <span className="font-bold text-slate-800">{nodeDetail.gpus[0]?.model || "None"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT PANEL — Multi-Accelerator & Telemetry Details */}
                  <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-white lg:col-span-8">
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-3.5 bg-slate-50/30">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-slate-700">Live Telemetry</h3>
                        {detailUpdatedAt && (
                          <span className="hidden sm:inline-block rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] text-slate-500 font-mono">
                            Refreshed: {new Date(detailUpdatedAt).toLocaleTimeString()}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => void refetchDetail()}
                          disabled={isDetailFetching}
                          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 cursor-pointer shadow-sm select-none"
                        >
                          <RefreshCw className={`size-3.5 text-slate-500 ${isDetailFetching ? "animate-spin" : ""}`} />
                          <span>{isDetailFetching ? "Syncing..." : "Refresh"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={closeModal}
                          className="hidden rounded-xl p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-zinc-900 lg:block cursor-pointer"
                        >
                          <X className="size-5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-slate-50/10 p-6">
                      {/* Host Metrics Row */}
                      <div className="mb-6 grid grid-cols-2 gap-4">
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">CPU Usage</h4>
                            <Activity className="size-4 text-emerald-500" />
                          </div>
                          <div className="mt-3 flex items-end gap-2">
                            <span className="text-3xl font-black text-slate-800">{nodeDetail.cpuUsage}%</span>
                          </div>
                          <div className="mt-4">
                            <ProgressBar value={nodeDetail.cpuUsage} />
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Memory Usage</h4>
                            <HardDrive className="size-4 text-amber-500" />
                          </div>
                          <div className="mt-3 flex items-end gap-2">
                            <span className="text-3xl font-black text-slate-800">{nodeDetail.memoryUsed}</span>
                            <span className="mb-1 text-sm font-bold text-slate-400">/ {nodeDetail.memoryTotal} GB</span>
                          </div>
                          <div className="mt-4">
                            <ProgressBar value={(nodeDetail.memoryUsed / nodeDetail.memoryTotal) * 100} />
                          </div>
                        </div>
                      </div>

                      {/* Accelerator List */}
                      <h4 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">GPU Details</h4>
                      
                      {nodeDetail.gpus.length === 0 ? (
                        <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 py-12 text-sm font-semibold text-slate-400 bg-white">
                          No GPUs detected on this node core.
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4">
                          {nodeDetail.gpus.map((gpu, index) => {
                            const vramPercent = gpu.memoryTotal > 0 ? (gpu.memoryUsed / gpu.memoryTotal) * 100 : 0
                            
                            return (
                              <div key={gpu.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                  
                                  <div className="flex items-center gap-3">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                                      <CircuitBoard className="size-5" />
                                    </div>
                                    <div>
                                      <h5 className="font-bold text-slate-700">GPU {index}</h5>
                                      <p className="text-xs font-medium text-slate-400">{gpu.model}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-4 text-sm font-bold">
                                    <div className="flex flex-col items-end">
                                      <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Core Util</span>
                                      <span className={gpu.utilization > 90 ? "text-red-500" : "text-slate-700"}>{gpu.utilization}%</span>
                                    </div>
                                    <div className="flex flex-col items-end border-l border-slate-100 pl-4">
                                      <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">VRAM</span>
                                      <span className="text-slate-700">{gpu.memoryUsed} / {gpu.memoryTotal} GB</span>
                                    </div>
                                    <div className="flex flex-col items-end border-l border-slate-100 pl-4">
                                      <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Temp</span>
                                      <span className="flex items-center gap-1 text-slate-700">
                                        <Thermometer className="size-3 text-red-400" /> {gpu.temperature}°C
                                      </span>
                                    </div>
                                    <div className="flex flex-col items-end border-l border-slate-100 pl-4">
                                      <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Power</span>
                                      <span className="flex items-center gap-1 text-slate-700">
                                        <Zap className="size-3 text-amber-500" /> {gpu.powerDraw}W
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Detailed Dual Linear Meters */}
                                <div className="mt-4 grid grid-cols-2 gap-4">
                                  <div>
                                    <div className="mb-1 flex justify-between text-[10px] font-bold text-slate-400">
                                      <span>Core</span>
                                    </div>
                                    <ProgressBar value={gpu.utilization} />
                                  </div>
                                  <div>
                                    <div className="mb-1 flex justify-between text-[10px] font-bold text-slate-400">
                                      <span>Memory</span>
                                    </div>
                                    <ProgressBar value={vramPercent} colorClass={vramPercent > 90 ? "bg-amber-500" : "bg-blue-500"} />
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}