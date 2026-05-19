import { apiRequest } from './api'

const BASE_API_URI = '/api/jobs'

export interface JobParams {
  jobName: string
  nodes: number
  ntasks: number
  ntasksPerNode: number | null
  cpus: number
  gpus: number
  memory: string
  walltime: string
  output?: string | null
  error?: string | null
  body: string
}

export interface SubmitResponse {
  job_id: number
  message: string
  staged_files: string[]
}

export const submitScriptApi = {
  submitJob: (params: JobParams, files: File[] = []) => {
    const form = new FormData()
    
    // Append the structured parameters as a stringified JSON object
    form.append('job_params', JSON.stringify(params))
    
    // Append all attached files
    files.forEach((f) => form.append('files', f))

    return apiRequest<SubmitResponse>(`${BASE_API_URI}/submit`, {
      method: 'POST',
      body: form,
    })
  },
}