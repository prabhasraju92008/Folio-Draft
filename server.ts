import "dotenv/config";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const MODEL_NAME = "gemini-4-hydrogen";

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Please check your API key in Settings > Secrets."
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const status =
        typeof err === "object" && err !== null && "status" in err
          ? Number((err as { status?: number }).status)
          : undefined;
      if (status && status >= 400 && status < 500 && status !== 429) {
        throw err;
      }
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 600 * attempt));
      }
    }
  }
  throw lastError;
}

function formatApiError(err: unknown): { status: number; message: string } {
  const rawMessage =
    err instanceof Error ? err.message : "An unexpected error occurred while generating the cover letter.";
  const upper = rawMessage.toUpperCase();

  if (
    upper.includes("API_KEY_INVALID") ||
    upper.includes("PERMISSION_DENIED") ||
    upper.includes("GEMINI_API_KEY IS NOT CONFIGURED")
  ) {
    return {
      status: 403,
      message:
        "Unable to authenticate with Gemini. Please check your API key in Settings > Secrets.",
    };
  }
  if (upper.includes("RESOURCE_EXHAUSTED") || upper.includes("429")) {
    return {
      status: 429,
      message:
        "The request quota has been temporarily reached. Please wait a moment and try again, or verify your API key in Settings > Secrets.",
    };
  }
  if (upper.includes("NOT_FOUND") || upper.includes("404")) {
    return {
      status: 502,
      message:
        "The configured Gemini model could not be reached. Please try again shortly.",
    };
  }
  return {
    status: 500,
    message: rawMessage,
  };
}

interface GeneratePayload {
  name?: string;
  degree?: string;
  skills?: string;
  experience?: string;
  company?: string;
  role?: string;
  jobDescription?: string;
  tone?: "balanced" | "confident" | "concise";
}

interface RefinePayload {
  coverLetter?: string;
  action?: "shorter" | "specific" | "warmer";
  company?: string;
  role?: string;
  name?: string;
  skills?: string;
  experience?: string;
  jobDescription?: string;
}

const coverLetterResponseSchema = {
  type: Type.OBJECT,
  properties: {
    subjectLine: {
      type: Type.STRING,
      description:
        "A crisp email subject line for submitting the application (under 12 words).",
    },
    coverLetter: {
      type: Type.STRING,
      description:
        "The complete, ready-to-send cover letter including salutation, 3 concise body paragraphs, and sign-off with the student's name. Strictly between 190 and 275 words total (never over 290 words). Use plain text with blank lines between paragraphs and no markdown syntax.",
    },
    connections: {
      type: Type.ARRAY,
      description:
        "3 concrete mappings showing how the student's specific skills, projects, or internship connect to requirements in the job description.",
      items: {
        type: Type.OBJECT,
        properties: {
          studentStrength: {
            type: Type.STRING,
            description: "Specific skill, project, or internship from the student profile (short phrase).",
          },
          jobRequirement: {
            type: Type.STRING,
            description: "Corresponding responsibility or requirement from the job description (short phrase).",
          },
          howConnected: {
            type: Type.STRING,
            description: "One clear sentence explaining how the letter bridges the two.",
          },
        },
        required: ["studentStrength", "jobRequirement", "howConnected"],
      },
    },
  },
  required: ["subjectLine", "coverLetter", "connections"],
};

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.post("/api/generate-cover-letter", async (req, res) => {
    try {
      const body = (req.body ?? {}) as GeneratePayload;
      const name = (body.name ?? "").trim();
      const degree = (body.degree ?? "").trim();
      const skills = (body.skills ?? "").trim();
      const experience = (body.experience ?? "").trim();
      const company = (body.company ?? "").trim();
      const role = (body.role ?? "").trim();
      const jobDescription = (body.jobDescription ?? "").trim();
      const tone = body.tone ?? "balanced";

      const missing: string[] = [];
      if (!name) missing.push("Name");
      if (!degree) missing.push("Degree");
      if (!skills) missing.push("Skills");
      if (!experience) missing.push("Projects / Internship");
      if (!company) missing.push("Company Name");
      if (!role) missing.push("Job Role");
      if (!jobDescription) missing.push("Job Description");

      if (missing.length > 0) {
        res.status(400).json({
          error: `Please fill in the required fields: ${missing.join(", ")}.`,
        });
        return;
      }

      const toneGuidance: Record<string, string> = {
        balanced:
          "Professional, articulate, and genuine—clear confidence without sounding stiff or boastful.",
        confident:
          "Direct, impact-forward, and crisp—lead with outcomes and technical ownership.",
        concise:
          "Ultra-tight and scannable—aim for 190 to 235 words where every sentence carries concrete evidence.",
      };

      const systemInstruction = [
        "You are an expert career editor who writes standout, ready-to-send cover letters for university students and recent graduates.",
        "Hard rules you must follow:",
        "1. STRICT LENGTH LIMIT: The entire coverLetter (from greeting to signature) MUST be strictly under 300 words. Target 215 to 265 words.",
        "2. SPECIFICITY OVER FLUFF: Connect concrete details from the student's degree, skills, and projects/internships directly to the company's actual job description. Never invent fake credentials, metrics, or experiences not supplied by the student.",
        "3. ANTI-CLICHÉ: Avoid generic openings like 'I am writing to express my keen interest', 'I am a passionate and hardworking student', or 'I am thrilled to apply'. Open immediately with a specific hook connecting the candidate's work to the role.",
        "4. READY TO SEND: Output clean plain text with no bracketed placeholders like [Date] or [Address] unless unavoidable. Use 'Dear Hiring Team,' (or 'Dear <Company> Hiring Team,'), 3 tightly focused paragraphs separated by blank lines, and close with 'Sincerely,' followed by the student's full name.",
        `5. TONE: ${toneGuidance[tone] ?? toneGuidance.balanced}`,
      ].join("\n");

      const prompt = [
        "Write a personalized cover letter and skill-to-role alignment breakdown using this brief:",
        "",
        `Student Name: ${name}`,
        `Degree / Academic Background: ${degree}`,
        `Key Skills: ${skills}`,
        `Projects / Internship Experience: ${experience}`,
        "",
        `Target Company: ${company}`,
        `Target Job Role: ${role}`,
        `Job Description:\n${jobDescription}`,
      ].join("\n");

      const ai = getGeminiClient();

      const parsed = await withRetry(async () => {
        const response = await ai.models.generateContent({
          model: MODEL_NAME,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: coverLetterResponseSchema,
          },
        });

        const rawText = (response.text ?? "").trim();
        if (!rawText) {
          throw new Error("Gemini returned an empty response. Please try again.");
        }
        return JSON.parse(rawText) as {
          subjectLine: string;
          coverLetter: string;
          connections: Array<{
            studentStrength: string;
            jobRequirement: string;
            howConnected: string;
          }>;
        };
      });

      let finalLetter = (parsed.coverLetter ?? "").trim();

      // Enforce the strict <300 words guarantee with a single tightening pass if needed.
      if (countWords(finalLetter) >= 295) {
        const tightenResponse = await withRetry(async () => {
          return ai.models.generateContent({
            model: MODEL_NAME,
            contents: `Tighten this cover letter so it is strictly between 220 and 265 words total while keeping all specific skills, projects, company name, greeting, and signature intact. Return only the plain-text cover letter with no extra commentary:\n\n${finalLetter}`,
            config: {
              systemInstruction:
                "You are a concise editorial copy editor. Preserve every concrete fact and keep the output strictly under 275 words in plain text.",
            },
          });
        });
        const tightened = (tightenResponse.text ?? "").trim();
        if (tightened && countWords(tightened) < 300) {
          finalLetter = tightened;
        }
      }

      res.json({
        subjectLine: (parsed.subjectLine ?? `Application for ${role} — ${name}`).trim(),
        coverLetter: finalLetter,
        wordCount: countWords(finalLetter),
        connections: Array.isArray(parsed.connections)
          ? parsed.connections.slice(0, 4)
          : [],
      });
    } catch (err) {
      const formatted = formatApiError(err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  app.post("/api/refine-cover-letter", async (req, res) => {
    try {
      const body = (req.body ?? {}) as RefinePayload;
      const coverLetter = (body.coverLetter ?? "").trim();
      const action = body.action ?? "shorter";

      if (!coverLetter) {
        res.status(400).json({ error: "No cover letter text provided to refine." });
        return;
      }

      const instructionMap: Record<string, string> = {
        shorter:
          "Trim this cover letter down to a crisp 185–225 words. Cut filler phrases while preserving the strongest skill-to-job evidence, greeting, and sign-off.",
        specific:
          "Sharpen the link between the student's projects/skills and the job description with more concrete phrasing, while keeping the entire letter strictly under 280 words.",
        warmer:
          "Make the tone slightly warmer and more human—still polished and concise—while keeping the entire letter strictly under 280 words.",
      };

      const ai = getGeminiClient();

      const refined = await withRetry(async () => {
        const response = await ai.models.generateContent({
          model: MODEL_NAME,
          contents: [
            instructionMap[action] ?? instructionMap.shorter,
            "",
            body.company && body.role
              ? `Target Role: ${body.role} at ${body.company}`
              : "",
            body.skills ? `Student Skills: ${body.skills}` : "",
            body.experience ? `Student Projects/Internship: ${body.experience}` : "",
            body.jobDescription ? `Job Description: ${body.jobDescription}` : "",
            "",
            `Current Cover Letter:\n${coverLetter}`,
          ]
            .filter(Boolean)
            .join("\n"),
          config: {
            systemInstruction:
              "You are an expert career editor. Return ONLY the revised plain-text cover letter (no markdown, no preamble, no quotes). The letter must be strictly under 290 words total.",
          },
        });
        return (response.text ?? "").trim();
      });

      if (!refined) {
        throw new Error("Could not refine the cover letter. Please try again.");
      }

      res.json({
        coverLetter: refined,
        wordCount: countWords(refined),
      });
    } catch (err) {
      const formatted = formatApiError(err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (_req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
