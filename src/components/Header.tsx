import React from "react";

export type ActiveView = "composer" | "saved" | "guide";

interface HeaderProps {
  activeView: ActiveView;
  savedCount: number;
  onChangeView: (view: ActiveView) => void;
  onNewApplication: () => void;
}

export function Header({
  activeView,
  savedCount,
  onChangeView,
  onNewApplication,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-[#F7F7F5]/95 backdrop-blur-sm border-b border-[#E4E4E7]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-8">
        <a
          href="#composer"
          onClick={(e) => {
            e.preventDefault();
            onChangeView("composer");
          }}
          className="font-editorial text-xl font-semibold tracking-tight text-[#18181B] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2563EB]"
        >
          FolioDraft
        </a>

        <nav
          aria-label="Primary"
          className="flex items-center gap-6 sm:gap-8 text-sm font-medium"
        >
          <button
            type="button"
            onClick={() => onChangeView("composer")}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2563EB] ${
              activeView === "composer"
                ? "border-[#18181B] text-[#18181B]"
                : "border-transparent text-[#52525B] hover:text-[#18181B]"
            }`}
          >
            Composer
          </button>

          <button
            type="button"
            onClick={() => onChangeView("saved")}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2563EB] ${
              activeView === "saved"
                ? "border-[#18181B] text-[#18181B]"
                : "border-transparent text-[#52525B] hover:text-[#18181B]"
            }`}
          >
            Saved Letters
            {savedCount > 0 && (
              <span className="ml-1.5 font-tabular text-xs text-[#71717A]">
                ({savedCount})
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onChangeView("guide")}
            className={`hidden sm:inline-block py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2563EB] ${
              activeView === "guide"
                ? "border-[#18181B] text-[#18181B]"
                : "border-transparent text-[#52525B] hover:text-[#18181B]"
            }`}
          >
            Writing Guide
          </button>
        </nav>

        <div className="shrink-0">
          <button
            type="button"
            onClick={onNewApplication}
            className="px-4 py-2 text-sm font-medium text-[#18181B] bg-white border border-[#D4D4D8] rounded-lg hover:border-[#18181B] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
          >
            New Role
          </button>
        </div>
      </div>
    </header>
  );
}
