import { getSiteConfiguration } from "./site-config";
import type { QuestionInput } from "./admin-content";

export interface ExplainQuestionParams {
  question: string;
  options: string[];
  userSelected?: string;
  correctAnswer: string;
  explanation?: string;
  exam?: string;
  subject?: string;
  userPrompt?: string; // e.g. "Explain in Hindi", "Why is Option B wrong?", "Give memory trick"
}

export interface ExplainQuestionResponse {
  success: boolean;
  explanationHtml: string;
  whyCorrect: string;
  whyIncorrect?: string;
  memoryTip?: string;
  source: "gemini" | "fallback";
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatQuestionParams {
  question: string;
  options: string[];
  userSelected?: string;
  correctAnswer: string;
  explanation?: string;
  exam?: string;
  subject?: string;
  chatHistory: ChatMessage[];
  userMessage: string;
}

export interface ChatQuestionResponse {
  success: boolean;
  reply: string;
  source: "gemini" | "guardrail" | "fallback";
  error?: string;
}

export interface GenerateQuestionsParams {
  exam: string;
  subject: string;
  topic: string;
  questionCount: number;
  optionCount: 4 | 5;
  difficulty: "easy" | "medium" | "hard";
  language: "bilingual" | "english" | "hindi";
}

export interface GeneratedQuestionItem {
  stem: string;
  options: { key: string; text: string; correct: boolean }[];
  explanation: string;
  exam: string;
  subject: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
}

/**
 * Resolve active Gemini API key from database or environment
 */
export async function getActiveGeminiApiKey(): Promise<{ apiKey: string; model: string; isConfigured: boolean }> {
  try {
    const config = await getSiteConfiguration();
    const key = (config.geminiApiKey || process.env.GEMINI_API_KEY || "").trim();
    let model = (config.aiModel || "gemini-2.5-flash").trim();
    if (model === "gemini-1.5-flash" || model === "gemini-1.5-pro") {
      model = "gemini-2.5-flash";
    }
    return {
      apiKey: key,
      model: model || "gemini-2.5-flash",
      isConfigured: Boolean(key && config.aiEnabled !== false),
    };
  } catch {
    const envKey = (process.env.GEMINI_API_KEY || "").trim();
    return {
      apiKey: envKey,
      model: "gemini-2.5-flash",
      isConfigured: Boolean(envKey),
    };
  }
}

/**
 * Robust Gemini API caller with automatic model fallback
 */
async function callGeminiGenerate(
  apiKey: string,
  preferredModel: string,
  payload: any
): Promise<{ ok: boolean; data?: any; error?: string; usedModel?: string }> {
  const candidateModels = Array.from(
    new Set([preferredModel, "gemini-2.5-flash", "gemini-flash-latest", "gemini-2.5-pro"])
  );

  let lastError = "";

  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        return { ok: true, data, usedModel: model };
      }

      const errData = await res.json().catch(() => null);
      lastError = errData?.error?.message || `HTTP ${res.status} ${res.statusText}`;

      // If it's a 404 (model not found), try next model in candidate list
      if (res.status === 404) {
        continue;
      }

      // Other fatal errors (e.g. invalid API key, quota exceeded)
      return { ok: false, error: lastError, usedModel: model };
    } catch (err: any) {
      lastError = err?.message || "Network error";
    }
  }

  return { ok: false, error: lastError };
}

/**
 * 1. AI Question Explainer & Doubt Solver
 */
export async function explainQuestionWithAI(params: ExplainQuestionParams): Promise<ExplainQuestionResponse> {
  const { apiKey, model, isConfigured } = await getActiveGeminiApiKey();

  if (isConfigured && apiKey) {
    try {
      const systemInstruction = `You are an elite competitive examination tutor for Indian state PSC and teacher recruitment exams (like BPSC TRE, Bihar STET, CTET, UPPSC).
Your goal is to provide a clear, accurate, bilingual (Hindi & English) breakdown of the question.
Format your response in structured JSON with the following keys:
{
  "whyCorrect": "Clear step-by-step concept breakdown explaining why the correct answer is true (in simple bilingual English + Hindi).",
  "whyIncorrect": "Specific reasoning why other options (and especially the user's selected choice if any) are incorrect or distractors.",
  "memoryTip": "A memorable mnemonic, trick, or key exam rule to remember this topic easily.",
  "summary": "1-2 sentence core takeaway."
}
Only output valid JSON without markdown wrapping.`;

      const userMessage = `Exam: ${params.exam || "State Teacher Recruitment / Commission Exam"}
Subject: ${params.subject || "General Studies & Pedagogy"}
Question: ${params.question}
Options:
${params.options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join("\n")}
Correct Answer: ${params.correctAnswer}
${params.userSelected ? `User's Selected Answer: ${params.userSelected}` : "User did not answer this question."}
${params.explanation ? `Official Solution Notes: ${params.explanation}` : ""}
${params.userPrompt ? `User Specific Doubt: "${params.userPrompt}"` : "Provide comprehensive bilingual analysis and doubt resolution."}`;

      const res = await callGeminiGenerate(apiKey, model, {
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemInstruction}\n\n${userMessage}` }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
          responseMimeType: "application/json",
        },
      });

      if (res.ok && res.data) {
        const rawText = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          return {
            success: true,
            whyCorrect: parsed.whyCorrect || "Correct option accurately reflects official commission syllabus norms.",
            whyIncorrect: parsed.whyIncorrect,
            memoryTip: parsed.memoryTip,
            explanationHtml: parsed.summary || parsed.whyCorrect,
            source: "gemini",
          };
        }
      }
    } catch (err) {
      console.error("Gemini explain call error:", err);
    }
  }

  // Fallback intelligent explanation engine
  return generateIntelligentFallbackExplanation(params);
}

/**
 * 2. Conversational AI Doubt Chat (Strictly bounded to the current question & topic)
 */
export async function chatQuestionWithAI(params: ChatQuestionParams): Promise<ChatQuestionResponse> {
  const { apiKey, model, isConfigured } = await getActiveGeminiApiKey();

  // Basic local topic relevance guardrail check
  const lowerMsg = (params.userMessage || "").toLowerCase().trim();
  const offTopicKeywords = [
    "who are you", "write code", "python script", "javascript", "crypto", "bitcoin",
    "dating", "movie", "weather", "recipe", "song", "joke", "politics news", "cricket score"
  ];
  if (offTopicKeywords.some(kw => lowerMsg.startsWith(kw) || lowerMsg === kw)) {
    return {
      success: true,
      reply: "🙏 **मैं इस प्रश्न के लिए आपका समर्पित AI डाउट ट्यूटर हूँ।** कृपया केवल इसी प्रश्न, इसके विकल्पों (Options), या संबंधित विषय-अवधारणा (Subject Concept) से जुड़े संदेह ही पूछें।",
      source: "guardrail",
    };
  }

  if (isConfigured && apiKey) {
    try {
      const systemInstruction = `You are a dedicated 1-on-1 AI Doubt Tutor for an Indian competitive exam aspirant (BPSC TRE, Bihar STET, CTET, SSC).
You are discussing THIS SPECIFIC QUESTION with the student:
- Exam: ${params.exam || "Commission Examination"}
- Subject: ${params.subject || "General Studies"}
- Question Prompt: "${params.question}"
- Options:
${params.options.map((opt, i) => `  ${String.fromCharCode(65 + i)}. ${opt}`).join("\n")}
- Correct Answer: "${params.correctAnswer}"
- Student's Selected Answer: "${params.userSelected || "Unanswered"}"
- Official Solution Note: "${params.explanation || "N/A"}"

STRICT TOPIC GUARDRAILS:
1. You MUST ONLY discuss matters directly related to this question, its options, why options are right/wrong, underlying academic concepts, or memory tricks for this topic.
2. If the user asks anything unrelated or outside this question's topic, POLITELY DECLINE:
   "I am your dedicated doubt tutor for this specific question. Please ask doubts related to this question or its subject concept only. (कृपया केवल इस प्रश्न या इससे जुड़े विषय से संबंधित संदेह ही पूछें।)"
3. Provide answers in clear, friendly, and bilingual (English + Hindi) explanation style. Use bullet points and bold highlights for readability.`;

      // Build conversation turns
      const contents: { role: string; parts: { text: string }[] }[] = [];

      // Initial context
      contents.push({
        role: "user",
        parts: [{ text: systemInstruction }],
      });
      contents.push({
        role: "model",
        parts: [{ text: "Understood. I will strictly act as the tutor for this specific question and concept." }],
      });

      // Prior history
      if (Array.isArray(params.chatHistory)) {
        for (const msg of params.chatHistory.slice(-6)) {
          contents.push({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }],
          });
        }
      }

      // Latest student prompt
      contents.push({
        role: "user",
        parts: [{ text: params.userMessage }],
      });

      const res = await callGeminiGenerate(apiKey, model, {
        contents,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1024,
        },
      });

      if (res.ok && res.data) {
        const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return {
            success: true,
            reply: text.trim(),
            source: "gemini",
          };
        }
      }

      if (res.error) {
        console.warn("Gemini chat error:", res.error);
      }
    } catch (err: any) {
      console.error("Gemini chat error:", err);
    }
  }

  // Fallback conversational reply
  const fallback = generateFallbackChatReply(params);
  return {
    success: true,
    reply: fallback,
    source: "fallback",
  };
}

/**
 * 3. AI Bulk Question Generator for Admin (Powered by Gemini)
 */
export async function generateQuestionsWithAI(params: GenerateQuestionsParams): Promise<{
  success: boolean;
  questions: GeneratedQuestionItem[];
  source: "gemini" | "fallback";
  error?: string;
}> {
  const { apiKey, model, isConfigured } = await getActiveGeminiApiKey();

  if (!isConfigured || !apiKey) {
    return {
      success: false,
      questions: [],
      source: "fallback",
      error: "Gemini API Key is not configured. Please enter your API key in Admin > Menu & Site Configuration > AI Engine.",
    };
  }

  const isFiveOptions = params.optionCount === 5;
  const isBpsc = params.exam.toLowerCase().includes("bpsc") || params.exam.toLowerCase().includes("tre");

  const systemPrompt = `You are a chief examination question paper setter for Indian competitive recruitment exams (${params.exam}).
Generate exactly ${params.questionCount} unique, high-yield multiple-choice questions aligned with the syllabus.

PARAMETERS:
- Target Exam: ${params.exam}
- Subject: ${params.subject}
- Chapter / Topic Focus: ${params.topic}
- Difficulty: ${params.difficulty}
- Language: ${params.language === "bilingual" ? "Bilingual (Question prompt in English + Hindi, options in bilingual format)" : params.language === "hindi" ? "Hindi (हिंदी माध्यम)" : "English"}

FORMAT REQUIREMENTS:
- Each question must have exactly ${params.optionCount} options (labeled A, B, C, D${isFiveOptions ? ", E" : ""}).
${isFiveOptions ? `- Option E must be: '${isBpsc ? "उपर्युक्त में से कोई नहीं / उपर्युक्त में से एक से अधिक (None of the above / More than one of the above)" : "None of the above / उपर्युक्त में से कोई नहीं"}'` : ""}
- Exactly ONE option must be marked with correct: true.
- Provide a clear, detailed conceptual explanation for each question explaining why the correct answer is right and why others are wrong.

RESPOND ONLY WITH A VALID JSON ARRAY OF OBJECTS:
[
  {
    "stem": "Detailed question text...",
    "options": [
      { "key": "A", "text": "Option A text", "correct": false },
      { "key": "B", "text": "Option B text", "correct": true },
      { "key": "C", "text": "Option C text", "correct": false },
      { "key": "D", "text": "Option D text", "correct": false }${isFiveOptions ? ',\n      { "key": "E", "text": "उपर्युक्त में से कोई नहीं / उपर्युक्त में से एक से अधिक (None of the above / More than one of the above)", "correct": false }' : ""}
    ],
    "explanation": "Detailed pedagogical explanation...",
    "difficulty": "${params.difficulty}"
  }
]
Do not wrap in markdown quotes or preamble. Only output raw JSON.`;

  const res = await callGeminiGenerate(apiKey, model, {
    contents: [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
    ],
    generationConfig: {
      temperature: 0.35,
      maxOutputTokens: 4096,
      responseMimeType: "application/json",
    },
  });

  if (res.ok && res.data) {
    const rawText = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (rawText) {
      try {
        const parsed = JSON.parse(rawText);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const formatted: GeneratedQuestionItem[] = parsed.map((q: any) => ({
            stem: q.stem || "Question",
            options: Array.isArray(q.options) ? q.options : [],
            explanation: q.explanation || "Official solution based on commission syllabus.",
            exam: params.exam,
            subject: params.subject,
            topic: params.topic,
            difficulty: params.difficulty,
          }));

          return {
            success: true,
            questions: formatted,
            source: "gemini",
          };
        }
      } catch (parseErr: any) {
        console.error("JSON parse error from Gemini questions output:", parseErr);
      }
    }
  }

  // If Gemini failed, return diagnostic error
  return {
    success: false,
    questions: [],
    source: "fallback",
    error: res.error || "Gemini API failed to generate questions. Please verify your API key and quota.",
  };
}

/**
 * Intelligent fallback explanation engine
 */
function generateIntelligentFallbackExplanation(params: ExplainQuestionParams): ExplainQuestionResponse {
  const whyCorrect = `The correct answer is "${params.correctAnswer}". According to official syllabus standards for ${params.exam || "this examination"}, this option accurately represents the established concept. (सही उत्तर "${params.correctAnswer}" है, जो आयोग के आधिकारिक पाठ्यक्रम के अनुरूप है।)`;

  const whyIncorrect = params.userSelected && params.userSelected !== params.correctAnswer
    ? `You chose "${params.userSelected}". This represents a common distractor or a partial fact that does not fulfill all conditions stated in the question stem. (आपने "${params.userSelected}" चुना था, जो एक सामान्य भ्रमित करने वाला विकल्प है।)`
    : "The alternative options are standard distractors often confused due to similar terminology.";

  const memoryTip = `💡 Exam Key Rule / स्मरण सूत्र: Focus on the root keyword in the prompt. Cross-verify with chronological timelines and eliminate extreme qualifiers before locking your answer.`;

  return {
    success: true,
    whyCorrect,
    whyIncorrect,
    memoryTip,
    explanationHtml: `${whyCorrect}\n\n${whyIncorrect}\n\n${memoryTip}`,
    source: "fallback",
  };
}

/**
 * Fallback conversational reply when API key is missing
 */
function generateFallbackChatReply(params: ChatQuestionParams): string {
  const msg = (params.userMessage || "").toLowerCase();
  if (msg.includes("hindi") || msg.includes("हिंदी")) {
    return `**हिंदी व्याख्या (Explanation in Hindi):**\n\nइस प्रश्न का सही उत्तर **"${params.correctAnswer}"** है। आयोग के आधिकारिक पाठ्यक्रम के अनुसार यह तथ्य पूर्णतः प्रामाणिक है। ${params.userSelected ? `आपके द्वारा चुना गया विकल्प "${params.userSelected}" गलत था क्योंकि यह मुख्य बिंदु को संतुष्ट नहीं करता।` : ""}`;
  }
  if (msg.includes("trick") || msg.includes("mnemonic") || msg.includes("याद")) {
    return `**💡 स्मरण सूत्र (Memory Trick):**\n\nइस विषय के मुख्य कीवर्ड (Keyword) को ध्यान में रखें। परीक्षा में जब भी "${params.question.slice(0, 40)}..." से संबंधित प्रश्न आए, तो मुख्य ऐतिहासिक या वैधानिक संदर्भ को याद रखें।`;
  }
  return `**Concept Clarification:**\n\nThe correct answer for this question is **"${params.correctAnswer}"**.\n\n${params.explanation ? `• **Key Point:** ${params.explanation}\n` : ""}• **Why distractors fail:** Alternative options either contain inaccurate qualifiers or refer to different events/clauses.\n\nDo you want me to explain this in Hindi or share a memory mnemonic for this concept?`;
}
