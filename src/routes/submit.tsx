import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { DEFAULTS, buildScript, parseScript, type FormFields, type Mode, type PartialFields, type Step } from "./submit/-submit.types"
import { ModeStep } from "./submit/step/-ModeStep"
import { EditorStep } from "./submit/step/-EditorStep"
import { ConfirmStep } from "./submit/step/-ConfirmStep"
import { SuccessStep } from "./submit/step/-SuccessStep"
import { type UploadedFile } from "./submit/-submit.types"

export const Route = createFileRoute("/submit")({
  component: SubmitPage,
})

function SubmitPage() {
  const [step, setStep] = useState<Step>("mode")
  const [mode, setMode] = useState<Mode>("scratch")
  const [fields, setFields] = useState<FormFields>(DEFAULTS)
  const [script, setScript] = useState(() => buildScript(DEFAULTS))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])  // ← add

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
      // TODO: wire up to jobsApi.submitJob(script)
      await new Promise((r) => setTimeout(r, 1000))
      setStep("success")
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