import { API_BASE_URL, apiRequest } from "./api"

export type StorageItem = {
  name: string
  path: string
  type: "file" | "folder"
  sizeBytes: number | null
  modifiedAt: number
}

export type ListDirectoryResponse = {
  success: boolean
  username: string
  currentPath: string
  items: StorageItem[]
}

export type CreateFolderResponse = {
  success: boolean
  message: string
  folder: {
    name: string
    path: string
  }
}

export type UploadFileResponse = {
  success: boolean
  message: string
  file: {
    name: string
    path: string
    sizeBytes: number
  }
}

export type DeleteItemResponse = {
  success: boolean
  message: string
  deleted: {
    type: "file" | "folder"
    path: string
  }
}

function buildQuery(params: Record<string, string | boolean | undefined>) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value))
    }
  })

  const query = searchParams.toString()
  return query ? `?${query}` : ""
}

function getAccessToken() {
  if (typeof window === "undefined") return null
  return localStorage.getItem("accessToken")
}

export function listDirectory(path = "") {
  return apiRequest<ListDirectoryResponse>(
    `/api/files/${buildQuery({ path })}`,
  )
}

export function createFolder(path: string) {
  return apiRequest<CreateFolderResponse>(
    `/api/files/folders${buildQuery({ path })}`,
    {
      method: "POST",
    },
  )
}

export function uploadFile(file: File, path = "", overwrite = false) {
  const formData = new FormData()
  formData.append("file", file)

  return apiRequest<UploadFileResponse>(
    `/api/files/upload${buildQuery({ path, overwrite })}`,
    {
      method: "POST",
      body: formData,
    },
  )
}

export async function downloadFile(path: string) {
  const token = getAccessToken()

  const response = await fetch(
    `${API_BASE_URL}/api/files/download${buildQuery({ path })}`,
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

  const blob = await response.blob()
  const filename = path.split("/").pop() || "download"

  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()

  link.remove()
  window.URL.revokeObjectURL(url)
}

export function deleteItem(path: string, recursive = false) {
  return apiRequest<DeleteItemResponse>(
    `/api/files/${buildQuery({ path, recursive })}`,
    {
      method: "DELETE",
    },
  )
}