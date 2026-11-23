import type { SavedDraft, StudentProfile } from "../types";

const PROFILE_STORAGE_KEY = "foliodraft_student_profile_v1";
const DRAFTS_STORAGE_KEY = "foliodraft_saved_drafts_v1";

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function estimateReadSeconds(wordCount: number): number {
  if (wordCount <= 0) return 0;
  return Math.max(15, Math.round((wordCount / 220) * 60));
}

export function formatReadTime(wordCount: number): string {
  const seconds = estimateReadSeconds(wordCount);
  if (seconds < 60) {
    return `${seconds} sec read`;
  }
  const minutes = Math.round(seconds / 60);
  return `${minutes} min read`;
}

export function sanitizeFilenameSegment(value: string, fallback: string): string {
  const cleaned = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return cleaned || fallback;
}

export function downloadCoverLetterTxt(
  letterText: string,
  name: string,
  company: string,
  role?: string
): void {
  const safeName = sanitizeFilenameSegment(name, "candidate");
  const safeCompany = sanitizeFilenameSegment(company, "company");
  const safeRole = role ? `_${sanitizeFilenameSegment(role, "")}` : "";
  const filename = `${safeName}_${safeCompany}${safeRole}_cover_letter.txt`;

  const blob = new Blob([letterText.trim() + "\n"], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function loadSavedProfile(): StudentProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StudentProfile>;
    return {
      name: typeof parsed.name === "string" ? parsed.name : "",
      degree: typeof parsed.degree === "string" ? parsed.degree : "",
      skills: typeof parsed.skills === "string" ? parsed.skills : "",
      experience: typeof parsed.experience === "string" ? parsed.experience : "",
    };
  } catch {
    return null;
  }
}

export function saveStudentProfile(profile: StudentProfile): void {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadSavedDrafts(): SavedDraft[] {
  try {
    const raw = localStorage.getItem(DRAFTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedDraft[]) : [];
  } catch {
    return [];
  }
}

export function saveDraftsList(drafts: SavedDraft[]): void {
  try {
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts.slice(0, 20)));
  } catch {
    // Ignore storage quota errors
  }
}

export function formatShortDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}
