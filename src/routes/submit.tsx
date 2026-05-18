import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { DEFAULTS, buildScript, parseScript, type FormFields, type Mode, type PartialFields, type Step } from "./submit/-submit.types"
import { ModeStep } from "./submit/step/-ModeStep"
import { EditorStep } from "./submit/step/-EditorStep"
import { ConfirmStep } from "./submit/step/-ConfirmStep"
import { SuccessStep } from "./submit/step/-SuccessStep"
import { FIELD_CONFIG } from "./submit/-submit.types"
import { type UploadedFile } from "./submit/-submit.types"
import { submitScriptApi } from "#/lib/submit"
import { AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

export const Route = createFileRoute("/submit")({
  component: SubmitPage,
})

function SubmitPage() {
  const [step, setStep] = useState<Step>("mode")
  const [mode, setMode] = useState<Mode>("scratch")
  const [fields, setFields] = useState<FormFields>(DEFAULTS)
  const [script, setScript] = useState(() => buildScript(DEFAULTS))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleError = (msg: string) => {
    setErrorMessage(msg)
    setTimeout(() => setErrorMessage(null), 3000)
  }

  // Step 1 → 2: user picked a mode
  const handleModeSelect = (m: Mode) => {
    setMode(m)
    setStep("editor")
  }

  // Editor: field form changed
  const handleFieldChange = (patch: PartialFields) => {
    const updated = { ...fields, ...patch } as FormFields
    setFields(updated)
    setScript(buildScript(updated))
  }

  // Editor: direct script edit (scratch mode only)
  const handleScriptEdit = (raw: string) => {
    setScript(raw)
    const parsed = parseScript(raw)
    setFields((prev) => ({ ...prev, ...parsed } as FormFields))
  }

  // Editor: file uploaded and parsed
  const handleParsed = (newScript: string, newFields: FormFields) => {
    if (newScript) {
      setScript(newScript)
      setFields((prev) => ({ ...prev, ...newFields } as FormFields))
    } else {
      setScript(buildScript(DEFAULTS))
      setFields(DEFAULTS)
    }
  }

  const handleReset = () => {
    setFields(DEFAULTS)
    setScript(buildScript(DEFAULTS))
  }

  // Step 2 → 3
  const handleGoToConfirm = () => setStep("confirm")

  // Step 3 → 4: submit
  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const fieldPayload = Object.fromEntries(
        FIELD_CONFIG.map((cfg) => [cfg.key, fields[cfg.key] ?? cfg.default]),
      )

      // 1. Format payload to match the backend types
      const jobParams = {
        jobName: fieldPayload.jobName || 'my_job',
        nodes: Number(fieldPayload.nodes ?? 1),
        cpus: Number(fieldPayload.cpus ?? 1),
        gpus: Number(fieldPayload.gpus ?? 0),
        memory: fieldPayload.memory || '1G',
        walltime: fieldPayload.walltime || '01:00:00',
        output: fieldPayload.output || null,
        error: fieldPayload.error || null,
        body: fields.body || '',
      }

      // 2. Extract raw File objects
      const rawFiles = uploadedFiles
        .map((f) => (f instanceof File ? f : (f as any).file))
        .filter(Boolean)

      // 3. Submit via the new API client
      const result = await submitScriptApi.submitJob(jobParams, rawFiles)
      console.log("Job staged and submitted successfully:", result)

      setStep("success")
    } catch (error) {
      console.error("Failed to submit Slurm job:", error)
      handleError("Failed to submit job to cluster.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success → reset back to step 1
  const handleSubmitAnother = () => {
    setStep("mode")
    setMode("scratch")
    setFields(DEFAULTS)
    setScript(buildScript(DEFAULTS))
  }

  return (
    <div className="box-border h-full overflow-hidden p-6 lg:p-10">
      <div className="flex h-full flex-col gap-6 overflow-hidden">

        {/* error msg */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: -20, x: 20 }}
              className="fixed right-6 top-6 z-[100] flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 shadow-xl shadow-red-500/10"
            >
              <AlertCircle className="size-5 shrink-0" />
              {errorMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page header */}
        <div className="shrink-0">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 lg:text-4xl">
            Submit a job
          </h1>

          {/* Step indicator */}
          {(() => {
            const STEPS: Step[] = ["mode", "editor", "confirm", "success"]
            const labels: Record<Step, string> = {
              mode: "Choose mode",
              editor: "Edit script",
              confirm: "Review",
              success: "Done",
            }
            const currentIndex = STEPS.indexOf(step)
            return (
              <div className="mt-5 w-full">
                {/* Labels row */}
                <div className="relative w-full mb-2">
                  {STEPS.map((s, i) => {
                    const isDone = i < currentIndex
                    const isCurrent = i === currentIndex
                    const isClickable = isDone && step !== "success"
                    const pct = (i / (STEPS.length - 1)) * 100
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={!isClickable}
                        onClick={() => isClickable && setStep(s)}
                        style={{
                          position: "absolute",
                          left: `${pct}%`,
                          transform: i === 0 ? "none" : i === STEPS.length - 1 ? "translateX(-100%)" : "translateX(-50%)",
                        }}
                        className={`transition-all duration-300 disabled:cursor-default ${isClickable ? "cursor-pointer" : ""}`}
                      >
                        <span className={`
                            transition-all duration-300 font-semibold whitespace-nowrap
                            ${isCurrent ? "text-sm text-zinc-900" : isDone ? "text-xs text-amber-500 hover:text-amber-700" : "text-[11px] text-zinc-400"}
                          `}>
                          {labels[s]}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Full-width track + amber fill */}
                <div className="relative h-0.5 w-full rounded-full bg-zinc-200">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
                  />
                  {/* Step tick marks */}
                  {STEPS.map((_, i) => {
                    const isDone = i <= currentIndex
                    return (
                      <div
                        key={i}
                        className={`absolute top-1/2 -translate-y-1/2 size-1.5 rounded-full transition-colors duration-300 ${isDone ? "bg-amber-400" : "bg-zinc-300"}`}
                        style={{ left: `calc(${(i / (STEPS.length - 1)) * 100}% - 3px)` }}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })()}
        </div>

        {/* Step content */}
        {step === "mode" && (
          <ModeStep onSelect={handleModeSelect} />
        )}

        {step === "editor" && (
          <EditorStep
            mode={mode}
            fields={fields}
            script={script}
            onFieldChange={handleFieldChange}
            onScriptEdit={handleScriptEdit}
            onParsed={handleParsed}
            onBack={() => setStep("mode")}
            onNext={handleGoToConfirm}
            onReset={handleReset}
            uploadedFiles={uploadedFiles}
            setUploadedFiles={setUploadedFiles}
            onError={() => handleError("Unable to proceed! Review your script again.")}
          />
        )}

        {step === "confirm" && (
          <ConfirmStep
            script={script}
            uploadedFiles={uploadedFiles}
            onBack={() => setStep("editor")}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}

        {step === "success" && (
          <SuccessStep onSubmitAnother={handleSubmitAnother} />
        )}
      </div>
    </div>
  )
}