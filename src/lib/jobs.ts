import { apiRequest } from './api'

const BASE_API_URI = '/api/jobs'

export interface Job {
  job_id: string
  job_name: string
  type: string
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
  memory: string
}

export interface JobStats {
  total_jobs: number
  by_status: Record<string, number>
  by_type: Record<string, number>
}

export type JobStatus = 'Running' | 'Pending' | 'Completed' | 'Failed' | 'Cancelled'
export type JobStatusFilter = 'all' | 'active' | 'completed' | 'failed' | 'cancelled'

export const jobsApi = {
  listJobs: (status?: JobStatusFilter, days = 7) => {
    const params = new URLSearchParams({ days: String(days) })
    if (status && status !== 'all') params.set('status', status)
    return apiRequest<Job[]>(`${BASE_API_URI}?${params}`)
  },

  getJob: (jobId: string) =>
    apiRequest<Job>(`${BASE_API_URI}/${jobId}`),

  getStats: (days = 7) => {
    const params = new URLSearchParams({ days: String(days) })
    return apiRequest<JobStats>(`${BASE_API_URI}/stats?${params}`)
  },

//   cancelJob: (jobId: string) =>
//     apiRequest<{ message: string }>(`${BASE_API_URI}/${jobId}/cancel`, { method: 'POST' }),
}