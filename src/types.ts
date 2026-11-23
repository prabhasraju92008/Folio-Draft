export type ToneOption = "balanced" | "confident" | "concise";

export type RefineAction = "shorter" | "specific" | "warmer";

export interface CoverLetterInput {
  name: string;
  degree: string;
  skills: string;
  experience: string;
  company: string;
  role: string;
  jobDescription: string;
  tone: ToneOption;
}

export interface StudentProfile {
  name: string;
  degree: string;
  skills: string;
  experience: string;
}

export interface SkillConnection {
  studentStrength: string;
  jobRequirement: string;
  howConnected: string;
}

export interface GeneratedLetter {
  subjectLine: string;
  coverLetter: string;
  wordCount: number;
  connections: SkillConnection[];
}

export interface SavedDraft {
  id: string;
  createdAt: string;
  company: string;
  role: string;
  name: string;
  tone: ToneOption;
  subjectLine: string;
  coverLetter: string;
  connections: SkillConnection[];
  input: CoverLetterInput;
}

export interface SamplePreset {
  id: string;
  label: string;
  input: CoverLetterInput;
}
