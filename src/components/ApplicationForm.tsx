import React from "react";
import { ArrowRight, Loader2, RotateCcw } from "lucide-react";
import { SAMPLE_PRESETS } from "../data/samples";
import type { CoverLetterInput, ToneOption } from "../types";

interface ApplicationFormProps {
  input: CoverLetterInput;
  isGenerating: boolean;
  error: string | null;
  onChange: <K extends keyof CoverLetterInput>(
    field: K,
    value: CoverLetterInput[K]
  ) => void;
  onApplyPreset: (presetId: string) => void;
  onClearJob: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const TONE_OPTIONS: Array<{ value: ToneOption; label: string }> = [
  { value: "balanced", label: "Balanced" },
  { value: "confident", label: "Confident" },
  { value: "concise", label: "Concise" },
];

export function ApplicationForm({
  input,
  isGenerating,
  error,
  onChange,
  onApplyPreset,
  onClearJob,
  onSubmit,
}: ApplicationFormProps) {
  const inputBaseClass =
    "w-full bg-white border border-[#D4D4D8] rounded-lg px-3.5 py-2.5 text-sm text-[#18181B] placeholder:text-[#A1A1AA] transition-colors focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15";

  const labelClass = "block text-sm font-medium text-[#18181B] mb-1.5";

  return (
    <form onSubmit={onSubmit} className="space-y-8" noValidate>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="font-editorial text-3xl sm:text-[2.125rem] font-semibold tracking-tight text-[#18181B] leading-[1.15] text-balance">
            Tailor your cover letter in seconds
          </h1>
        </div>
        <p className="text-sm sm:text-[15px] text-[#52525B] leading-relaxed max-w-xl">
          Enter your background once and paste any job description. FolioDraft connects your skills and projects to the role in a crisp letter under 300 words.
        </p>

        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 pt-1 text-xs text-[#71717A]">
          <span>Try an example:</span>
          {SAMPLE_PRESETS.map((preset, idx) => (
            <React.Fragment key={preset.id}>
              {idx > 0 && <span aria-hidden="true">·</span>}
              <button
                type="button"
                onClick={() => onApplyPreset(preset.id)}
                className="text-[#2563EB] hover:text-[#1D4ED8] hover:underline font-medium cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
              >
                {preset.label}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="border-t border-[#E4E4E7] pt-6 space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-base font-semibold text-[#18181B]">
            01. Student Profile
          </h2>
          <span className="text-xs text-[#71717A]">
            Saved locally for reuse
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="candidate-name" className={labelClass}>
              Full Name
            </label>
            <input
              id="candidate-name"
              type="text"
              value={input.name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="e.g., Ananya Rao"
              className={inputBaseClass}
              required
            />
          </div>

          <div>
            <label htmlFor="candidate-degree" className={labelClass}>
              Degree &amp; University
            </label>
            <input
              id="candidate-degree"
              type="text"
              value={input.degree}
              onChange={(e) => onChange("degree", e.target.value)}
              placeholder="e.g., B.S. Computer Science, Class of 2027"
              className={inputBaseClass}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="candidate-skills" className={labelClass}>
            Skills
          </label>
          <input
            id="candidate-skills"
            type="text"
            value={input.skills}
            onChange={(e) => onChange("skills", e.target.value)}
            placeholder="e.g., Python, React, TypeScript, SQL, Figma, Data Visualization"
            className={inputBaseClass}
            required
          />
        </div>

        <div>
          <label htmlFor="candidate-experience" className={labelClass}>
            Projects &amp; Internship Experience
          </label>
          <textarea
            id="candidate-experience"
            rows={4}
            value={input.experience}
            onChange={(e) => onChange("experience", e.target.value)}
            placeholder="Briefly describe 1–2 relevant projects or internships and what you built or achieved..."
            className={`${inputBaseClass} resize-y leading-relaxed`}
            required
          />
        </div>
      </div>

      <div className="border-t border-[#E4E4E7] pt-6 space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-base font-semibold text-[#18181B]">
            02. Target Position
          </h2>
          {(input.company || input.role || input.jobDescription) && (
            <button
              type="button"
              onClick={onClearJob}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#52525B] hover:text-[#18181B] transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Clear role
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="target-company" className={labelClass}>
              Company Name
            </label>
            <input
              id="target-company"
              type="text"
              value={input.company}
              onChange={(e) => onChange("company", e.target.value)}
              placeholder="e.g., Stripe"
              className={inputBaseClass}
              required
            />
          </div>

          <div>
            <label htmlFor="target-role" className={labelClass}>
              Job Role
            </label>
            <input
              id="target-role"
              type="text"
              value={input.role}
              onChange={(e) => onChange("role", e.target.value)}
              placeholder="e.g., Software Engineering Intern"
              className={inputBaseClass}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="job-description" className={labelClass}>
            Job Description
          </label>
          <textarea
            id="job-description"
            rows={5}
            value={input.jobDescription}
            onChange={(e) => onChange("jobDescription", e.target.value)}
            placeholder="Paste the role responsibilities and qualifications from the job posting..."
            className={`${inputBaseClass} resize-y leading-relaxed`}
            required
          />
        </div>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-[#52525B] whitespace-nowrap">
              Tone
            </span>
            <div
              role="radiogroup"
              aria-label="Letter tone"
              className="inline-flex items-center p-1 bg-[#EAEAE6] rounded-lg"
            >
              {TONE_OPTIONS.map((option) => {
                const active = input.tone === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => onChange("tone", option.value)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#2563EB] ${
                      active
                        ? "bg-white text-[#18181B] shadow-xs"
                        : "text-[#52525B] hover:text-[#18181B]"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#2563EB]/60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                Drafting letter...
              </>
            ) : (
              <>
                Generate Cover Letter
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </>
            )}
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="p-3.5 text-sm text-[#991B1B] bg-[#FEF2F2] border border-[#FECACA] rounded-lg"
          >
            {error}
          </div>
        )}
      </div>
    </form>
  );
}
