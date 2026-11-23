import React, { useState } from "react";
import {
  AlertCircle,
  Check,
  Copy,
  Download,
  FileText,
  Loader2,
  RefreshCw,
} from "lucide-react";
import type { RefineAction, SkillConnection } from "../types";
import {
  countWords,
  downloadCoverLetterTxt,
  formatReadTime,
} from "../utils/letterUtils";

interface LetterPreviewProps {
  letterText: string;
  subjectLine: string;
  connections: SkillConnection[];
  candidateName: string;
  company: string;
  role: string;
  isGenerating: boolean;
  isRefining: RefineAction | null;
  onEditLetter: (nextText: string) => void;
  onRegenerate: () => void;
  onRefine: (action: RefineAction) => void;
  onQuickStartSample: () => void;
}

export function LetterPreview({
  letterText,
  subjectLine,
  connections,
  candidateName,
  company,
  role,
  isGenerating,
  isRefining,
  onEditLetter,
  onRegenerate,
  onRefine,
  onQuickStartSample,
}: LetterPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [subjectCopied, setSubjectCopied] = useState(false);

  const hasLetter = letterText.trim().length > 0;
  const wordCount = countWords(letterText);
  const isOverLimit = wordCount > 300;
  const readTime = formatReadTime(wordCount);

  async function handleCopyLetter() {
    if (!hasLetter) return;
    try {
      await navigator.clipboard.writeText(letterText.trim());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for clipboard restrictions
      const textarea = document.createElement("textarea");
      textarea.value = letterText.trim();
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleCopySubject() {
    if (!subjectLine.trim()) return;
    try {
      await navigator.clipboard.writeText(subjectLine.trim());
      setSubjectCopied(true);
      window.setTimeout(() => setSubjectCopied(false), 1800);
    } catch {
      // Ignore clipboard error
    }
  }

  function handleDownload() {
    if (!hasLetter) return;
    downloadCoverLetterTxt(letterText, candidateName, company, role);
  }

  return (
    <section aria-label="Generated cover letter" className="flex flex-col h-full">
      <div className="bg-white border border-[#E4E4E7] rounded-xl flex flex-col flex-1 overflow-hidden">
        {/* Document toolbar */}
        <div className="px-6 py-4 border-b border-[#E4E4E7] flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-[#18181B] truncate">
              {hasLetter
                ? `${company || "Company"} — ${role || "Target Role"}`
                : "Cover Letter Sheet"}
            </h2>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-[#71717A]">
              {hasLetter ? (
                <>
                  <span
                    className={`font-tabular font-medium inline-flex items-center gap-1 ${
                      isOverLimit ? "text-[#B91C1C]" : "text-[#18181B]"
                    }`}
                  >
                    {isOverLimit && (
                      <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                    )}
                    {wordCount} / 300 words
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{isOverLimit ? "Over 300-word target" : "Ready to send"}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-tabular">{readTime}</span>
                </>
              ) : (
                <span>Target length: under 300 words · Plain text export</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyLetter}
              disabled={!hasLetter || isGenerating}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#18181B] bg-white border border-[#D4D4D8] hover:border-[#18181B] disabled:opacity-45 disabled:hover:border-[#D4D4D8] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#15803D]" aria-hidden="true" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  Copy
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={!hasLetter || isGenerating}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#18181B] hover:bg-[#27272A] disabled:bg-[#A1A1AA] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              Download as .txt
            </button>
          </div>
        </div>

        {/* Subject line strip when available */}
        {hasLetter && subjectLine && (
          <div className="px-6 py-2.5 bg-[#FAFAFA] border-b border-[#E4E4E7] flex items-center justify-between gap-3 text-xs">
            <div className="min-w-0 flex items-baseline gap-2">
              <span className="text-[#71717A] shrink-0">Subject:</span>
              <span className="text-[#18181B] font-medium truncate">
                {subjectLine}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopySubject}
              className="text-[#52525B] hover:text-[#18181B] font-medium whitespace-nowrap shrink-0 cursor-pointer"
            >
              {subjectCopied ? "Copied" : "Copy subject"}
            </button>
          </div>
        )}

        {/* Paper body */}
        <div className="p-6 sm:p-8 flex-1 flex flex-col">
          {isGenerating ? (
            <div className="flex-1 min-h-[380px] flex flex-col items-center justify-center text-center px-4">
              <Loader2
                className="w-6 h-6 text-[#2563EB] animate-spin mb-4"
                aria-hidden="true"
              />
              <p className="font-editorial text-lg font-medium text-[#18181B]">
                Mapping your experience to {company || "the role"}
              </p>
              <p className="mt-1.5 text-sm text-[#71717A] max-w-sm">
                Connecting your degree, skills, and projects into a tailored cover letter under 300 words.
              </p>
            </div>
          ) : hasLetter ? (
            <>
              <label htmlFor="cover-letter-editor" className="sr-only">
                Editable cover letter text
              </label>
              <textarea
                id="cover-letter-editor"
                value={letterText}
                onChange={(e) => onEditLetter(e.target.value)}
                rows={15}
                spellCheck
                className="w-full flex-1 min-h-[380px] bg-transparent text-[#18181B] text-[15px] leading-[1.78] font-normal resize-y focus:outline-none"
              />

              {/* Quick refinement bar */}
              <div className="mt-6 pt-4 border-t border-[#F1F1EE] flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-[#71717A] mr-1">Refine draft:</span>
                  {(
                    [
                      { id: "shorter", label: "Tighten length" },
                      { id: "specific", label: "More specific" },
                      { id: "warmer", label: "Warmer tone" },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      disabled={isRefining !== null}
                      onClick={() => onRefine(item.id)}
                      className="px-2.5 py-1.5 text-xs font-medium text-[#3F3F46] bg-[#F4F4F2] hover:bg-[#E4E4E7] disabled:opacity-50 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isRefining === item.id ? "Updating..." : item.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={isRefining !== null}
                  onClick={onRegenerate}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#52525B] hover:text-[#18181B] disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                  Regenerate
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 min-h-[400px] flex flex-col justify-between py-2">
              <div className="max-w-lg space-y-6">
                <div className="w-10 h-10 rounded-lg bg-[#F4F4F2] flex items-center justify-center text-[#52525B]">
                  <FileText className="w-5 h-5" aria-hidden="true" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-editorial text-2xl font-medium text-[#18181B] text-balance">
                    Your tailored cover letter will appear here
                  </h3>
                  <p className="text-sm text-[#52525B] leading-relaxed">
                    Fill out your student profile and target job description on the left. You can edit every line directly on this sheet before exporting as a clean <span className="font-tabular text-xs text-[#18181B]">.txt</span> file.
                  </p>
                </div>

                <div className="border-t border-[#E4E4E7] pt-5 space-y-3 text-sm">
                  <div className="grid grid-cols-[24px_1fr] gap-2">
                    <span className="font-tabular text-xs text-[#71717A] pt-0.5">01</span>
                    <p className="text-[#3F3F46]">
                      <span className="font-medium text-[#18181B]">Focused opening:</span> Leads directly with why your background fits the team, skipping generic templates.
                    </p>
                  </div>
                  <div className="grid grid-cols-[24px_1fr] gap-2">
                    <span className="font-tabular text-xs text-[#71717A] pt-0.5">02</span>
                    <p className="text-[#3F3F46]">
                      <span className="font-medium text-[#18181B]">Evidence bridge:</span> Connects your actual coursework, technical skills, and projects to the job requirements.
                    </p>
                  </div>
                  <div className="grid grid-cols-[24px_1fr] gap-2">
                    <span className="font-tabular text-xs text-[#71717A] pt-0.5">03</span>
                    <p className="text-[#3F3F46]">
                      <span className="font-medium text-[#18181B]">Strict sub-300-word discipline:</span> Concise enough for a recruiter to read completely in under 60 seconds.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <button
                  type="button"
                  onClick={onQuickStartSample}
                  className="text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8] hover:underline cursor-pointer"
                >
                  Load a sample student profile and generate now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Skill-to-Role Alignment section below sheet */}
      {hasLetter && connections.length > 0 && (
        <div className="mt-6 pt-6 border-t border-[#E4E4E7]">
          <div className="flex items-baseline justify-between gap-4 mb-4">
            <h3 className="text-sm font-semibold text-[#18181B]">
              How your skills connect to this role
            </h3>
            <span className="text-xs text-[#71717A] font-tabular">
              {connections.length} alignments
            </span>
          </div>

          <div className="divide-y divide-[#E4E4E7]">
            {connections.map((item, idx) => (
              <div
                key={`${item.studentStrength}-${idx}`}
                className="py-3.5 first:pt-0 last:pb-0 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4"
              >
                <div className="md:col-span-5 text-xs leading-relaxed">
                  <span className="font-semibold text-[#18181B]">
                    {item.studentStrength}
                  </span>
                  <span className="mx-1.5 text-[#A1A1AA]" aria-hidden="true">
                    →
                  </span>
                  <span className="text-[#52525B]">{item.jobRequirement}</span>
                </div>
                <p className="md:col-span-7 text-xs text-[#52525B] leading-relaxed">
                  {item.howConnected}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
