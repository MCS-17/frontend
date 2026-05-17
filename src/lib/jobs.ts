import { apiRequest, API_BASE_URL } from './api'

const BASE_API_URI = '/api/slurm'

export interface Job {
  job_id: string
  job_name: string
  status: 'Running' | 'Pending' | 'Completed' | 'Failed' | 'Cancelled'
  submitted: string | null
  start: string | null
  end: string | null
  runtime: string
  credits: number | null  // populated from MongoDB separately
  exit_code: string
  user: string
  nodes: string
  cpus: number
  gpus: number
  stdout: string | null
  stderr: string | null
  memory_requested: string
  memory_used: string
}

export interface JobStats {
  total_jobs: number
  by_status: Record<string, number>
  by_type: Record<string, number>
}

export interface JobOutput {
  job_id: string
  path: string | null
  content: string
  truncated: boolean
}

export type JobStatus = 'Running' | 'Pending' | 'Completed' | 'Failed' | 'Cancelled'
export type JobStatusFilter = 'all' | 'running' | 'pending' | 'completed' | 'failed' | 'cancelled'

function getAccessToken() {
  if (typeof window === "undefined") return null
  return localStorage.getItem("accessToken")
}

export async function downloadFile(url: string, name: string) {
  const token = getAccessToken()
  const response = await fetch(
    url,
    {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    },
  )

  if (!response.ok) {
    let detail = `Download failed with status ${response.status}`

    try {
      const data = await response.json()
      if (data?.detail) detail = String(data.detail)
    } catch {
      // Ignore JSON parse error for non-JSON response
    }

    throw new Error(detail)
  }

  const contentDisposition = response.headers.get("Content-Disposition")
  const filename = contentDisposition
    ? contentDisposition.split("filename=")[1]?.replace(/"/g, "")
    : `${name}.txt`

  const blob = await response.blob()

  const objUrl = window.URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = objUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()

  link.remove()
  window.URL.revokeObjectURL(objUrl)
}


export const jobsApi = {
  listJobs: (status?: JobStatusFilter, days = 7) => {
    const params = new URLSearchParams({ days: String(days) })
    if (status && status !== 'all') params.set('status', status)
    return apiRequest<Job[]>(`${BASE_API_URI}/jobs?${params}`)
  },

  getJob: (jobId: string) =>
    apiRequest<Job>(`${BASE_API_URI}/jobs/${jobId}`),

  getStats: (days = 7) => {
    const params = new URLSearchParams({ days: String(days) })
    return apiRequest<JobStats>(`${BASE_API_URI}/stats?${params}`)
  },

  getOutput: (jobId: string) => 
    apiRequest<JobOutput>(`${BASE_API_URI}/jobs/${jobId}/output`),

  getError: (jobId: string) => 
    apiRequest<JobOutput>(`${BASE_API_URI}/jobs/${jobId}/error`),

  downloadOutput: (jobId: string) =>
    downloadFile(`${API_BASE_URL}${BASE_API_URI}/jobs/${jobId}/output/download`, 'output'),

  downloadError: (jobId: string) =>
    downloadFile(`${API_BASE_URL}${BASE_API_URI}/jobs/${jobId}/error/download`, 'error')

//   cancelJob: (jobId: string) =>
//     apiRequest<{ message: string }>(`${BASE_API_URI}/${jobId}/cancel`, { method: 'POST' }),
}