export type Mode = "scratch" | "upload"
export type FieldKey = string
export type FormFields = Record<FieldKey, string>
export type PartialFields = Record<FieldKey, string | undefined>

export type Step = "mode" | "editor" | "confirm" | "success"

export interface FieldConfig {
  key: FieldKey
  label: string
  hint?: string
  placeholder?: string
  type: "text" | "number" | "textarea"
  default: string
  pattern?: string // <-- ADD THIS
  sbatchFlag?: string
  sbatchSerialize?: (value: string) => string | null
  sbatchParse?: (script: string) => string | undefined
  section: string
  colSpan?: 1 | 2
}

export interface UploadedFile {
  name: string
  size: number
  path: string
  file: File  // ← add this
}

export const FIELD_CONFIG: FieldConfig[] = [
  // ── Job details ──────────────────────────────────────────────────────────────
  {
    key: "jobName",
    label: "Job name",
    placeholder: "my_job",
    type: "text",
    default: "my_job",
    sbatchFlag: "job-name",
    section: "Job details",
    colSpan: 2,
  },

  // ── Resources ────────────────────────────────────────────────────────────────
  {
    key: "nodes",
    label: "Nodes",
    hint: "default: 1",
    type: "number",
    default: "1",
    sbatchFlag: "nodes",
    section: "Resources",
    colSpan: 1,
  },
  {
    key: "ntasks",
    label: "NTasks",
    hint: "default: 1",
    type: "number",
    default: "1",
    sbatchFlag: "ntasks",
    section: "Resources",
    colSpan: 1,
  },
  {
    key: "ntasksPerNode",
    label: "NTasks / node",
    hint: "optional",
    type: "number",
    default: "0",
    sbatchSerialize: (v) => (parseInt(v) > 0 ? `#SBATCH --ntasks-per-node=${v}` : null),
    sbatchParse: (script) => script.match(/--ntasks-per-node=(\d+)/)?.[1],
    section: "Resources",
    colSpan: 1,
  },
  {
    key: "cpus",
    label: "CPUs / task",
    hint: "default: 1",
    type: "number",
    default: "1",
    sbatchFlag: "cpus-per-task",
    section: "Resources",
    colSpan: 1,
  },
  {
    key: "gpus",
    label: "GPUs / Node",
    hint: "default: 0",
    type: "number",
    default: "0",
    sbatchSerialize: (v) => (parseInt(v) > 0 ? `#SBATCH --gpus-per-node=${v}` : null),
    sbatchParse: (script) => script.match(/--gpus-per-node=(\d+)/)?.[1],
    section: "Resources",
    colSpan: 1,
  },
  {
    key: "memory",
    label: "Memory",
    hint: "default: 8G",
    placeholder: "e.g. 16G",
    type: "text",
    default: "8G",
    pattern: "^\\d+[kKmMgGtT]$", // <-- Native HTML regex validation
    sbatchFlag: "mem",
    section: "Resources",
    colSpan: 1,
    sbatchSerialize: (value) => {
      const sanitized = value.trim().toUpperCase()
      if (/^\d+[KMGT]$/.test(sanitized)) {
        return `#SBATCH --mem=${sanitized}`
      }
      if (/^\d+$/.test(sanitized)) {
        return `#SBATCH --mem=${sanitized}G`
      }
      return `#SBATCH --mem=1G`
    },
    sbatchParse: (script) => {
      const match = script.match(/^#SBATCH --mem=(\d+[KMGT])/im)
      return match ? match[1].toUpperCase() : undefined
    },
  },
  {
    key: "walltime",
    label: "Walltime limit",
    hint: "HH:MM:SS",
    placeholder: "01:00:00",
    type: "text",
    default: "01:00:00",
    sbatchFlag: "time",
    section: "Resources",
    pattern: "^\\d{2}:\\d{2}:\\d{2}$",
    colSpan: 2,
  },

  // ── Paths ────────────────────────────────────────────────────────────────────
  {
    key: "output",
    label: "Output file",
    type: "text",
    default: "%x_%j.out",
    sbatchFlag: "output",
    section: "Paths",
    colSpan: 2,
  },
  {
    key: "error",
    label: "Error file",
    type: "text",
    default: "%x_%j.err",
    sbatchFlag: "error",
    section: "Paths",
    colSpan: 2,
  },

  // ── Script body ──────────────────────────────────────────────────────────────
  {
    key: "body",
    label: "Commands",
    type: "textarea",
    default: "module load python/3.11\npython main.py",
    section: "Script body",
    colSpan: 2,
  },
]

// Single source of truth for default values
export const DEFAULTS: FormFields = Object.fromEntries(
  FIELD_CONFIG.map((f) => [f.key, f.default]),
)

export function buildScript(fields: FormFields): string {
  const lines: string[] = ["#!/bin/bash"]

  for (const cfg of FIELD_CONFIG) {
    if (cfg.key === "body") continue
    const value = fields[cfg.key] ?? cfg.default

    if (cfg.sbatchSerialize) {
      const line = cfg.sbatchSerialize(value)
      if (line) lines.push(line)
    } else if (cfg.sbatchFlag) {
      lines.push(`#SBATCH --${cfg.sbatchFlag}=${value}`)
    }
  }

  lines.push("")
  const body = fields["body"] ?? DEFAULTS["body"]
  body.split("\n").forEach((l) => lines.push(l))
  return lines.join("\n")
}

export function parseScript(text: string): FormFields {
  const result: Record<string, string> = {}

  for (const cfg of FIELD_CONFIG) {
    if (cfg.key === "body") continue

    if (cfg.sbatchParse) {
      const v = cfg.sbatchParse(text)
      if (v !== undefined) result[cfg.key] = v
    } else if (cfg.sbatchFlag) {
      const m = text.match(new RegExp(`--${cfg.sbatchFlag}=([^\n]+)`))
      if (m) result[cfg.key] = m[1].trim()
    }
  }

  const bodyMatch = text.match(/(?:#SBATCH[^\n]*\n)+\n?([\s\S]*)$/)
  if (bodyMatch) result["body"] = bodyMatch[1].trim()

  return result
}
