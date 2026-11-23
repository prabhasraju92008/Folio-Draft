import React from "react";
import { Download, Trash2, ArrowUpRight } from "lucide-react";
import type { SavedDraft } from "../types";
import {
  countWords,
  downloadCoverLetterTxt,
  formatShortDate,
} from "../utils/letterUtils";

interface SavedDraftsViewProps {
  drafts: SavedDraft[];
  onOpenDraft: (draft: SavedDraft) => void;
  onDeleteDraft: (id: string) => void;
  onStartNew: () => void;
}

export function SavedDraftsView({
  drafts,
  onOpenDraft,
  onDeleteDraft,
  onStartNew,
}: SavedDraftsViewProps) {
  return (
    <section className="max-w-4xl mx-auto py-10 px-5 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-[#E4E4E7]">
        <div>
          <h1 className="font-editorial text-3xl font-semibold tracking-tight text-[#18181B]">
            Saved Cover Letters
          </h1>
          <p className="mt-1.5 text-sm text-[#52525B]">
            Every letter you generate is kept locally in your browser so you can revisit or export company applications anytime.
          </p>
        </div>
        <span className="text-xs text-[#71717A] font-tabular">
          {drafts.length} {drafts.length === 1 ? "letter" : "letters"}
        </span>
      </div>

      {drafts.length === 0 ? (
        <div className="py-16 text-center space-y-4">
          <p className="font-editorial text-xl text-[#18181B]">
            No saved letters yet
          </p>
          <p className="text-sm text-[#52525B] max-w-md mx-auto">
            Generate your first tailored cover letter in the Composer and it will automatically appear here for quick access.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onStartNew}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg transition-colors cursor-pointer"
            >
              Open Composer
            </button>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-[#E4E4E7]">
          {drafts.map((draft) => {
            const words = countWords(draft.coverLetter);
            return (
              <article
                key={draft.id}
                className="py-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="min-w-0 space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                    <h2 className="text-base font-semibold text-[#18181B]">
                      {draft.company}
                    </h2>
                    <span className="text-sm text-[#52525B]">{draft.role}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#71717A]">
                    <span>{draft.name}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-tabular">{words} words</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{draft.tone} tone</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-tabular">
                      {formatShortDate(draft.createdAt)}
                    </span>
                  </div>

                  <p className="text-sm text-[#52525B] line-clamp-2 pt-1 leading-relaxed">
                    {draft.coverLetter}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-1">
                  <button
                    type="button"
                    onClick={() => onOpenDraft(draft)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#18181B] bg-white border border-[#D4D4D8] hover:border-[#18181B] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Open
                    <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      downloadCoverLetterTxt(
                        draft.coverLetter,
                        draft.name,
                        draft.company,
                        draft.role
                      )
                    }
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[#18181B] hover:bg-[#27272A] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" aria-hidden="true" />
                    .txt
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteDraft(draft.id)}
                    aria-label={`Delete cover letter for ${draft.company}`}
                    className="p-1.5 text-[#71717A] hover:text-[#B91C1C] transition-colors rounded-md cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
