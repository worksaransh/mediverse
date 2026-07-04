import Anthropic from "@anthropic-ai/sdk";

export interface MentorQuery {
  question: string;
  context?: string;
  subject?: string;
  userId?: string;
}

export interface MentorResponse {
  answer: string;
  references?: string[];
  confidence?: number;
  contentIds?: string[];
}

export interface OnboardingData {
  examTarget: string;
  currentYear: string;
  examTargetYear: number;
  examDate: string;
  weakSubjects: string[];
}

export interface AIProfile {
  strengths_summary: string;
  study_strategy: string;
  weekly_goals: string[];
  recommended_resources: string[];
}

/**
 * Ask the AI Mentor a medical question.
 * Uses Anthropic Claude under the hood.
 * Returns a mock response when ANTHROPIC_API_KEY is not set.
 */
export async function askMentor(query: MentorQuery): Promise<MentorResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey === "sk-ant-xxxxx") {
    console.warn("[AI] ANTHROPIC_API_KEY not set — returning mock response");
    return {
      answer: `[Mock] Response for: "${query.question}". Configure ANTHROPIC_API_KEY for real AI responses.`,
      references: [],
      confidence: 0,
    };
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-latest",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `You are an expert medical AI Mentor. Answer the following medical query clearly, with clinical correlations: ${query.question}`,
        },
      ],
    });
    
    const content = response.content[0]?.type === "text" ? response.content[0].text : "";
    return {
      answer: content || "No response text found.",
      references: [],
      confidence: 0.9,
    };
  } catch (error) {
    console.error("[AI] Error calling Anthropic:", error);
    return {
      answer: "An error occurred while connecting to the AI Mentor service.",
      references: [],
      confidence: 0,
    };
  }
}

/**
 * Generate a custom AI profile using a cheap Claude call on onboarding completion.
 */
export async function generateAIProfile(data: OnboardingData): Promise<AIProfile> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  const mockProfile: AIProfile = {
    strengths_summary: `Student is starting their active ${data.examTarget} preparation in the ${data.currentYear} stage. Shows readiness to tackle clinical workflows.`,
    study_strategy: `Focus first on high-yield topics within ${data.weakSubjects.join(", ")}. Dedicate 45 minutes daily to active recall MCQs and spaced repetition reviews.`,
    weekly_goals: [
      `Review 30 key questions in ${data.weakSubjects[0] || "General Medicine"}`,
      `Create 10 diagnostic mnemonics for difficult concepts`,
      `Complete a baseline self-assessment quiz`,
    ],
    recommended_resources: [
      `PubMed high-yield reviews for ${data.weakSubjects[0] || "General Medicine"}`,
      `Interactive clinical study card templates`,
    ],
  };

  if (!apiKey || apiKey === "sk-ant-xxxxx") {
    console.warn("[AI] ANTHROPIC_API_KEY not set — returning default mock AI profile");
    return mockProfile;
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    const prompt = `You are a medical study planner. Create a study plan for a student preparing for the "${data.examTarget}" exam targeting the year ${data.examTargetYear}. 
The student is currently at the study stage of "${data.currentYear}".
Their reported weak subjects are: ${data.weakSubjects.join(", ")}.

Provide a structured study plan as a raw, valid JSON object containing exactly these keys:
- "strengths_summary" (string summarizing their profile)
- "study_strategy" (string detailing strategic steps for weak areas)
- "weekly_goals" (array of strings, list of concrete goals for this week)
- "recommended_resources" (array of strings, specific medical literature or tools)

Do NOT include any codeblocks, markdowns, or explanations. Respond with ONLY the raw JSON string.`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-latest",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text = response.content[0]?.type === "text" ? response.content[0].text.trim() : "";
    try {
      const parsed = JSON.parse(text);
      return {
        strengths_summary: parsed.strengths_summary || mockProfile.strengths_summary,
        study_strategy: parsed.study_strategy || mockProfile.study_strategy,
        weekly_goals: parsed.weekly_goals || mockProfile.weekly_goals,
        recommended_resources: parsed.recommended_resources || mockProfile.recommended_resources,
      };
    } catch (parseError) {
      console.warn("[AI] Failed to parse Claude response JSON, returning mock profile:", text);
      return mockProfile;
    }
  } catch (error) {
    console.error("[AI] Error calling Anthropic for profile:", error);
    return mockProfile;
  }
}

/**
 * Classifies an incoming student prompt.
 */
export async function routeIntent(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const lower = prompt.toLowerCase();
  
  // Unsafe clinical keyword override
  const isClinical = [
    "diagnose", "treatment for", "what should i take", "prescribe", 
    "chest pain radiating", "symptom of", "diagnose me", "my chest hurts", 
    "rash on my", "cure for", "is this cancer"
  ].some(k => lower.includes(k));

  if (isClinical) return "unsafe_clinical";

  const isResearch = [
    "research", "paper", "study", "trial", "pubmed", "lancet", "clinical study"
  ].some(k => lower.includes(k));

  if (isResearch) return "research_query";

  const isNews = [
    "news", "breakthrough", "recent guideline", "latest report", "fda approval"
  ].some(k => lower.includes(k));

  if (isNews) return "news_query";

  const isPlan = [
    "plan", "schedule", "strategy", "timeline", "routine"
  ].some(k => lower.includes(k));

  if (isPlan) return "study_plan";

  const isHelp = [
    "help", "support", "contact", "issue", "bug", "error", "reset"
  ].some(k => lower.includes(k));

  if (isHelp) return "platform_help";

  if (!apiKey || apiKey === "sk-ant-xxxxx") {
    return "study_help";
  }

  // Real LLM-based classification fallback
  try {
    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-latest",
      max_tokens: 20,
      messages: [
        {
          role: "user",
          content: `Classify the following medical query into exactly one category: 'study_help', 'study_plan', 'research_query', 'news_query', 'platform_help', 'unsafe_clinical'.
Query: "${prompt}"
Respond with ONLY the category string and nothing else.`,
        },
      ],
    });
    const content = response.content[0]?.type === "text" ? response.content[0].text.trim() : "";
    const cleaned = content.replace(/['"]/g, "").toLowerCase();
    if (["study_help", "study_plan", "research_query", "news_query", "platform_help", "unsafe_clinical"].includes(cleaned)) {
      return cleaned;
    }
    return "study_help";
  } catch (e) {
    return "study_help";
  }
}

export interface MentorResponseParams {
  userId: string;
  prompt: string;
  intent: string;
  context?: string;
  userProfile?: {
    name: string;
    careerStage: string;
    examTargetYear: number;
    aiProfile?: any;
  };
  masteryList?: Array<{ topicTag: string; accuracyEma: number }>;
}

/**
 * Orchestrates persona layout, safety filters, and generates AI Mentor response.
 */
export async function generateMentorResponse(params: MentorResponseParams): Promise<{
  answer: string;
  citedContentIds: string[];
  flagged: boolean;
}> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // 1. Check Unsafe Clinical Intent immediately
  if (params.intent === "unsafe_clinical") {
    return {
      answer: "AI-generated Disclaimer: I am an AI Mentor study assistant, not a doctor. This platform does not provide diagnostic assessments or medical treatments. Please consult a licensed physician or visit a healthcare center immediately for clinical concerns.",
      citedContentIds: [],
      flagged: true,
    };
  }

  // 2. Format profile blocks
  const name = params.userProfile?.name || "Student";
  const stage = params.userProfile?.careerStage || "pg_prep";
  const targetYear = params.userProfile?.examTargetYear || 2027;
  const weakSubjects = params.userProfile?.aiProfile?.weak_subjects?.join(", ") || "None";
  
  const masteryText = params.masteryList && params.masteryList.length > 0
    ? params.masteryList.map(m => `- ${m.topicTag}: ${(m.accuracyEma * 100).toFixed(0)}% accuracy`).join("\n")
    : "No topic mastery metrics logged yet.";

  const basePersona = `You are the Mediverse AI Mentor, a high-yield medical coach for NEET PG and MBBS aspirants in India. Your primary goal is to explain complex clinical vignettes, teach medical terminology, clarify board exam concepts, and provide active recall study tips. Focus on exam relevance and physiological mechanisms.`;
  
  const safetyRules = `SAFETY_RULES: Never provide clinical diagnosis, prescriptions, or triage advice. If the prompt contains clinical self-diagnosis queries, immediately redirect the user to a clinical professional and mention this is an educational platform. Every message must start with "AI-generated: ".`;

  const profileBlock = `USER PROFILE:\n- Name: ${name}\n- Career Stage: ${stage}\n- Target Exam Year: ${targetYear}\n- Weak Areas: ${weakSubjects}`;
  
  const performanceBlock = `STUDENT PERFORMANCE MASTERY:\n${masteryText}`;

  const skillInstructions = params.intent === "research_query" || params.intent === "news_query"
    ? `INSTRUCTIONS: Synthesize facts from the provided RAG context below. CITE resources in your text using the bracketed ID form [feed-item-X] when relevant. If the context does not contain the answer, state that you do not have enough literature citations in your database rather than fabricating.`
    : `INSTRUCTIONS: Answer the query using high-yield medical points, keeping explanations structured and clinical.`;

  const contextBlock = params.context ? `RAG LITERATURE CONTEXT:\n${params.context}` : "";

  const systemPrompt = `${basePersona}\n\n${safetyRules}\n\n${profileBlock}\n\n${performanceBlock}\n\n${skillInstructions}`;

  // 3. Mock Response Fallback if no API key
  if (!apiKey || apiKey === "sk-ant-xxxxx") {
    let mockAnswer = "AI-generated: ";
    let citedContentIds: string[] = [];

    if (params.intent === "research_query") {
      mockAnswer += `Based on the latest literature [feed-item-3], breast neoplasms exhibit distinct HER2 overexpression profiles that guide therapeutic selections. We currently lack other relevant literature citations in our database for further extensions.`;
      citedContentIds = ["feed-item-3"];
    } else if (params.intent === "news_query") {
      mockAnswer += `The Lancet has highlighted significant guidelines regarding clinical and surgical trials [feed-item-8], showing wound repair maturation dynamics.`;
      citedContentIds = ["feed-item-8"];
    } else if (params.intent === "study_plan") {
      mockAnswer += `Since your target exam is ${targetYear}, let's focus on structured recall blocks. I recommend setting up daily MCQ practice sets, specifically targeting your onboarding focus area: ${weakSubjects}.`;
    } else {
      mockAnswer += `Let's break down this concept. Physiological mechanisms suggest that renal filtration rates are dependent on hydrostatic pressure gradients. I recommend reviewing glomerular lesions in renal pathology next.`;
    }

    return {
      answer: mockAnswer,
      citedContentIds,
      flagged: false,
    };
  }

  // 4. Real LLM Call using Claude Sonnet/Haiku
  try {
    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `${contextBlock}\n\nQuery: "${params.prompt}"`,
        },
      ],
    });

    const answer = response.content[0]?.type === "text" ? response.content[0].text : "No response content found.";
    
    // Parse cited_content_ids out of the text (e.g. looking for brackets [feed-item-X])
    const citedContentIds: string[] = [];
    const matches = answer.match(/\[feed-item-\d+\]/g);
    if (matches) {
      matches.forEach((m) => {
        const cleanedId = m.replace(/[\[\]]/g, "");
        if (!citedContentIds.includes(cleanedId)) {
          citedContentIds.push(cleanedId);
        }
      });
    }

    return {
      answer,
      citedContentIds,
      flagged: false,
    };
  } catch (error: any) {
    console.error("[AI Mentor] Error in generative call:", error);
    return {
      answer: "AI-generated: I encountered an error when communicating with the mentor service. Please try again.",
      citedContentIds: [],
      flagged: false,
    };
  }
}
