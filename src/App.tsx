import React, { useEffect, useState } from "react";
import { Header, type ActiveView } from "./components/Header";
import { ApplicationForm } from "./components/ApplicationForm";
import { LetterPreview } from "./components/LetterPreview";
import { SavedDraftsView } from "./components/SavedDraftsView";
import { WritingGuide } from "./components/WritingGuide";
import { SAMPLE_PRESETS } from "./data/samples";
import type {
  CoverLetterInput,
  GeneratedLetter,
  RefineAction,
  SavedDraft,
  SkillConnection,
} from "./types";
import {
  loadSavedDrafts,
  loadSavedProfile,
  saveDraftsList,
  saveStudentProfile,
} from "./utils/letterUtils";

function createInitialInput(): CoverLetterInput {
  const savedProfile = loadSavedProfile();
  return {
    name: savedProfile?.name ?? "",
    degree: savedProfile?.degree ?? "",
    skills: savedProfile?.skills ?? "",
    experience: savedProfile?.experience ?? "",
    company: "",
    role: "",
    jobDescription: "",
    tone: "balanced",
  };
}

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>("composer");
  const [input, setInput] = useState<CoverLetterInput>(createInitialInput);
  const [letterText, setLetterText] = useState<string>("");
  const [subjectLine, setSubjectLine] = useState<string>("");
  const [connections, setConnections] = useState<SkillConnection[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [savedDrafts, setSavedDrafts] = useState<SavedDraft[]>(loadSavedDrafts);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState<RefineAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Persist student profile fields locally whenever edited
  useEffect(() => {
    saveStudentProfile({
      name: input.name,
      degree: input.degree,
      skills: input.skills,
      experience: input.experience,
    });
  }, [input.name, input.degree, input.skills, input.experience]);

  function handleFieldChange<K extends keyof CoverLetterInput>(
    field: K,
    value: CoverLetterInput[K]
  ) {
    setInput((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  }

  function handleApplyPreset(presetId: string) {
    const preset = SAMPLE_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    setInput({ ...preset.input });
    setError(null);
  }

  function handleClearJob() {
    setInput((prev) => ({
      ...prev,
      company: "",
      role: "",
      jobDescription: "",
    }));
    setLetterText("");
    setSubjectLine("");
    setConnections([]);
    setActiveDraftId(null);
    setError(null);
  }

  function handleNewApplication() {
    setActiveView("composer");
    handleClearJob();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function generateForInput(payload: CoverLetterInput) {
    setError(null);

    const missing: string[] = [];
    if (!payload.name.trim()) missing.push("Full Name");
    if (!payload.degree.trim()) missing.push("Degree");
    if (!payload.skills.trim()) missing.push("Skills");
    if (!payload.experience.trim()) missing.push("Projects & Internship Experience");
    if (!payload.company.trim()) missing.push("Company Name");
    if (!payload.role.trim()) missing.push("Job Role");
    if (!payload.jobDescription.trim()) missing.push("Job Description");

    if (missing.length > 0) {
      setError(`Please complete the required fields: ${missing.join(", ")}.`);
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as Partial<GeneratedLetter> & {
        error?: string;
      };

      if (!response.ok || !data.coverLetter) {
        throw new Error(
          data.error || "Failed to generate cover letter. Please try again."
        );
      }

      const generatedLetter = data.coverLetter.trim();
      const generatedSubject =
        data.subjectLine?.trim() ||
        `Application for ${payload.role.trim()} — ${payload.name.trim()}`;
      const generatedConnections = Array.isArray(data.connections)
        ? data.connections
        : [];

      setLetterText(generatedLetter);
      setSubjectLine(generatedSubject);
      setConnections(generatedConnections);

      const newDraft: SavedDraft = {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}`,
        createdAt: new Date().toISOString(),
        company: payload.company.trim(),
        role: payload.role.trim(),
        name: payload.name.trim(),
        tone: payload.tone,
        subjectLine: generatedSubject,
        coverLetter: generatedLetter,
        connections: generatedConnections,
        input: { ...payload },
      };

      setActiveDraftId(newDraft.id);
      setSavedDrafts((prev) => {
        const next = [newDraft, ...prev].slice(0, 20);
        saveDraftsList(next);
        return next;
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while contacting the server."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void generateForInput(input);
  }

  function handleQuickStartSample() {
    const preset = SAMPLE_PRESETS[0];
    setInput({ ...preset.input });
    void generateForInput(preset.input);
  }

  function handleEditLetter(nextText: string) {
    setLetterText(nextText);
    if (!activeDraftId) return;
    setSavedDrafts((prev) => {
      const next = prev.map((draft) =>
        draft.id === activeDraftId ? { ...draft, coverLetter: nextText } : draft
      );
      saveDraftsList(next);
      return next;
    });
  }

  async function handleRefine(action: RefineAction) {
    if (!letterText.trim() || isRefining !== null) return;
    setIsRefining(action);
    setError(null);

    try {
      const response = await fetch("/api/refine-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coverLetter: letterText,
          action,
          company: input.company,
          role: input.role,
          name: input.name,
          skills: input.skills,
          experience: input.experience,
          jobDescription: input.jobDescription,
        }),
      });

      const data = (await response.json()) as {
        coverLetter?: string;
        error?: string;
      };

      if (!response.ok || !data.coverLetter) {
        throw new Error(
          data.error || "Unable to refine cover letter. Please try again."
        );
      }

      handleEditLetter(data.coverLetter.trim());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to refine cover letter. Please try again."
      );
    } finally {
      setIsRefining(null);
    }
  }

  function handleOpenDraft(draft: SavedDraft) {
    setInput({ ...draft.input });
    setLetterText(draft.coverLetter);
    setSubjectLine(draft.subjectLine);
    setConnections(draft.connections);
    setActiveDraftId(draft.id);
    setError(null);
    setActiveView("composer");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDeleteDraft(id: string) {
    setSavedDrafts((prev) => {
      const next = prev.filter((item) => item.id !== id);
      saveDraftsList(next);
      return next;
    });
    if (activeDraftId === id) {
      setActiveDraftId(null);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5] text-[#18181B]">
      <Header
        activeView={activeView}
        savedCount={savedDrafts.length}
        onChangeView={setActiveView}
        onNewApplication={handleNewApplication}
      />

      <main className="flex-1">
        {activeView === "composer" && (
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 sm:py-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              <div className="lg:col-span-5">
                <ApplicationForm
                  input={input}
                  isGenerating={isGenerating}
                  error={error}
                  onChange={handleFieldChange}
                  onApplyPreset={handleApplyPreset}
                  onClearJob={handleClearJob}
                  onSubmit={handleSubmit}
                />
              </div>

              <div className="lg:col-span-7 lg:sticky lg:top-24">
                <LetterPreview
                  letterText={letterText}
                  subjectLine={subjectLine}
                  connections={connections}
                  candidateName={input.name}
                  company={input.company}
                  role={input.role}
                  isGenerating={isGenerating}
                  isRefining={isRefining}
                  onEditLetter={handleEditLetter}
                  onRegenerate={() => void generateForInput(input)}
                  onRefine={(action) => void handleRefine(action)}
                  onQuickStartSample={handleQuickStartSample}
                />
              </div>
            </div>
          </div>
        )}

        {activeView === "saved" && (
          <SavedDraftsView
            drafts={savedDrafts}
            onOpenDraft={handleOpenDraft}
            onDeleteDraft={handleDeleteDraft}
            onStartNew={() => setActiveView("composer")}
          />
        )}

        {activeView === "guide" && (
          <WritingGuide onBackToComposer={() => setActiveView("composer")} />
        )}
      </main>

      <footer className="border-t border-[#E4E4E7] mt-12">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5 flex flex-wrap items-center justify-between gap-4 text-xs text-[#71717A]">
          <span>FolioDraft · Concise cover letters under 300 words</span>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setActiveView("composer")}
              className="hover:text-[#18181B] transition-colors cursor-pointer"
            >
              Composer
            </button>
            <button
              type="button"
              onClick={() => setActiveView("saved")}
              className="hover:text-[#18181B] transition-colors cursor-pointer"
            >
              Saved Letters
            </button>
            <button
              type="button"
              onClick={() => setActiveView("guide")}
              className="hover:text-[#18181B] transition-colors cursor-pointer"
            >
              Writing Guide
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
