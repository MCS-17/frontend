import { apiRequest } from './api'

const BASE_API_URI = '/api/nodes'

// Interface representing an accelerator sub-component
export interface GpuInfo {
  id: string
  model: string
  utilization: number
  memoryUsed: number
  memoryTotal: number
  temperature: number
  powerDraw: number
}

// Interface for the high-level cluster layout view (Endpoint 1)
export interface NodeSummary {
  id: string
  name: string
  status: 'Online' | 'Offline'
  uptime: string
  cpuUsage: number
  memoryUsed: number
  memoryTotal: number
  avgGpuUsage: number
}

// Interface for the detailed single node drawer/modal view (Endpoint 2)
export interface NodeDetail {
  id: string
  name: string
  status: 'Online' | 'Offline'
  uptime: string
  cpuModel: string
  cpuCores: number
  cpuUsage: number
  memoryUsed: number
  memoryTotal: number
  gpus: GpuInfo[]
}

export const nodesApi = {
  // Fetches high-level metrics for all 4 worker cards
  listNodesSummary: () =>
    apiRequest<NodeSummary[]>(`${BASE_API_URI}`),

  // Fetches comprehensive hardware specifics for one isolated node
  getNodeDetails: (nodeId: string) =>
    apiRequest<NodeDetail>(`${BASE_API_URI}/${nodeId}`),
}