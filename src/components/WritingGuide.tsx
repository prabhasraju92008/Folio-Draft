import React from "react";

interface WritingGuideProps {
  onBackToComposer: () => void;
}

export function WritingGuide({ onBackToComposer }: WritingGuideProps) {
  return (
    <section className="max-w-4xl mx-auto py-10 px-5 sm:px-8 space-y-10">
      <div className="pb-6 border-b border-[#E4E4E7] space-y-2">
        <h1 className="font-editorial text-3xl font-semibold tracking-tight text-[#18181B] text-balance">
          Why sub-300-word cover letters get read
        </h1>
        <p className="text-[15px] text-[#52525B] max-w-2xl leading-relaxed">
          Hiring managers typically spend less than a minute scanning an application. A concise, specific letter outperforms a full-page generic summary every time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-2">
          <span className="font-tabular text-xs text-[#71717A]">01</span>
          <h2 className="text-base font-semibold text-[#18181B]">
            Start with evidence, not filler
          </h2>
          <p className="text-sm text-[#52525B] leading-relaxed">
            Skip phrases like &ldquo;I am writing to express my keen interest.&rdquo; Open with the exact role, your degree or relevant project, and why that company&apos;s work caught your attention.
          </p>
        </div>

        <div className="space-y-2">
          <span className="font-tabular text-xs text-[#71717A]">02</span>
          <h2 className="text-base font-semibold text-[#18181B]">
            Bridge projects to the job post
          </h2>
          <p className="text-sm text-[#52525B] leading-relaxed">
            Recruiters want proof that you can handle their problems. Pick one internship or capstone project and link the tools you used directly to two core requirements from the job description.
          </p>
        </div>

        <div className="space-y-2">
          <span className="font-tabular text-xs text-[#71717A]">03</span>
          <h2 className="text-base font-semibold text-[#18181B]">
            Keep the closing crisp
          </h2>
          <p className="text-sm text-[#52525B] leading-relaxed">
            End in two sentences: restate how you can contribute to the team and invite a conversation. Export as plain <span className="font-tabular text-xs text-[#18181B]">.txt</span> or paste cleanly into application portals without formatting issues.
          </p>
        </div>
      </div>

      <div className="pt-6 border-t border-[#E4E4E7] flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-[#52525B]">
          Tip: Add concrete outcomes (e.g., &ldquo;cut load time by 35%&rdquo; or &ldquo;analyzed 50,000 rows&rdquo;) in your Projects field for stronger results.
        </p>
        <button
          type="button"
          onClick={onBackToComposer}
          className="px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Back to Composer
        </button>
      </div>
    </section>
  );
}
