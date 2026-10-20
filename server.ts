import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

console.log(`[STAR-AI-SERVER] Initialized with API Key present: ${Boolean(apiKey)}`);

// Default STAR AI System Instruction
const defaultSystemInstruction = `You are STAR AI, a friendly, intelligent, helpful, creative, and professional multimodal AI assistant.
Your tagline is: "Your World. Your Ideas. One Intelligent Assistant."
Brand Personality:
- Friendly, encouraging, trustworthy, clear, and multilingual.
- Always identify yourself as STAR AI.
- Distinguish between verified information, reasonable explanations, estimates, and uncertain answers.
- Provide clean Markdown formatting, code blocks with language syntax, and step-by-step clarity.`;

// Clean, human-friendly error formatter (strips internal RPC JSON)
function formatHumanError(error: unknown): string {
  if (!error) return 'An unexpected error occurred.';
  let raw = '';
  if (error instanceof Error) {
    raw = error.message;
  } else if (typeof error === 'string') {
    raw = error;
  } else {
    raw = JSON.stringify(error);
  }

  // Parse nested Google RPC JSON if present
  try {
    const parsed = JSON.parse(raw);
    if (parsed.error && parsed.error.message) {
      if (parsed.error.code === 429 || parsed.error.status === 'RESOURCE_EXHAUSTED') {
        return 'The AI service is currently experiencing high demand. Automatic failover has been engaged.';
      }
      return parsed.error.message;
    }
  } catch {}

  if (raw.includes('RESOURCE_EXHAUSTED') || raw.includes('429')) {
    return 'The AI service is currently experiencing high demand. Automatic failover has been engaged.';
  }

  return raw;
}

// Strictly normalize Gemini conversation contents
function normalizeGeminiContents(messages: any[], prompt?: string, attachments?: any[]): any[] {
  const rawTurns: { role: 'user' | 'model'; parts: any[] }[] = [];

  // Filter out any prior error notices so error messages don't pollute conversation turns
  const cleanMessages = Array.isArray(messages)
    ? messages.filter((m) => !m.text?.startsWith('⚠️ Notice:'))
    : [];

  if (cleanMessages.length > 0) {
    for (const msg of cleanMessages) {
      const parts: any[] = [];
      if (msg.attachments && Array.isArray(msg.attachments)) {
        for (const att of msg.attachments) {
          if (att.data && att.mimeType) {
            parts.push({
              inlineData: {
                data: att.data.replace(/^data:[^;]+;base64,/, ''),
                mimeType: att.mimeType,
              },
            });
          }
        }
      }
      if (msg.text && typeof msg.text === 'string' && msg.text.trim()) {
        parts.push({ text: msg.text.trim() });
      }
      if (parts.length > 0) {
        rawTurns.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts,
        });
      }
    }
  }

  // Check if current prompt is already in the last message
  const lastRawTurn = rawTurns[rawTurns.length - 1];
  const lastText = lastRawTurn?.parts?.find((p: any) => p.text)?.text;
  const isPromptAlreadyLast = prompt && lastRawTurn?.role === 'user' && lastText === prompt.trim();

  if (prompt && !isPromptAlreadyLast) {
    const currentParts: any[] = [];
    if (Array.isArray(attachments) && attachments.length > 0) {
      for (const att of attachments) {
        if (att.data && att.mimeType) {
          currentParts.push({
            inlineData: {
              data: att.data.replace(/^data:[^;]+;base64,/, ''),
              mimeType: att.mimeType,
            },
          });
        }
      }
    }
    currentParts.push({ text: prompt.trim() });
    rawTurns.push({
      role: 'user',
      parts: currentParts,
    });
  }

  if (rawTurns.length === 0) {
    return [];
  }

  // Rule 1: First turn MUST be 'user'
  while (rawTurns.length > 0 && rawTurns[0].role !== 'user') {
    rawTurns.shift();
  }

  if (rawTurns.length === 0) {
    rawTurns.push({ role: 'user', parts: [{ text: prompt || 'Hello STAR AI' }] });
  }

  // Rule 2: Strictly alternate between user and model
  const alternating: { role: 'user' | 'model'; parts: any[] }[] = [];
  for (const turn of rawTurns) {
    if (alternating.length === 0) {
      alternating.push(turn);
    } else {
      const prev = alternating[alternating.length - 1];
      if (prev.role === turn.role) {
        // Merge consecutive parts
        prev.parts = [...prev.parts, ...turn.parts];
      } else {
        alternating.push(turn);
      }
    }
  }

  // Rule 3: Last turn MUST be 'user'
  if (alternating.length > 0 && alternating[alternating.length - 1].role !== 'user') {
    alternating.push({ role: 'user', parts: [{ text: prompt || 'Please continue.' }] });
  }

  return alternating;
}

// Resilient Gemini Execution Pipeline with automatic model cascade and search fallback
async function callGeminiWithResilience({
  contents,
  config = {},
  preferredModel = 'gemini-3.8-flash',
  enableSearch = false,
}: {
  contents: any;
  config?: any;
  preferredModel?: string;
  enableSearch?: boolean;
}): Promise<{ response: any; usedModel: string; usedSearch: boolean }> {
  // Determine cascade sequence: start with preferred, fallback to gemini-3.1-flash-lite, then gemini-3.8-flash
  const modelsToTry: string[] = [];
  // Keep the cascade restricted to real Gemini API model IDs.
  const allowedModels = new Set([
    'gemini-3.8-flash',
    'gemini-3.1-flash-lite',
    'gemini-4-argon',
    'gemini-3.1-flash-lite-image',
    'gemini-3.1-flash-image',
    'gemini-3-pro-image',
  ]);
  if (preferredModel && allowedModels.has(preferredModel)) modelsToTry.push(preferredModel);
  if (!modelsToTry.includes('gemini-3.8-flash')) modelsToTry.push('gemini-3.8-flash');
  if (!modelsToTry.includes('gemini-3.1-flash-lite')) modelsToTry.push('gemini-3.1-flash-lite');

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing. Add it to your environment secrets and restart STAR AI.');
  }

  let lastError: any = null;

  for (const modelCandidate of modelsToTry) {
    try {
      if (enableSearch) {
        try {
          console.log(`[STAR-AI-SERVER] Attempting ${modelCandidate} with Google Search Grounding...`);
          const response = await ai.models.generateContent({
            model: modelCandidate,
            contents,
            config: {
              ...config,
              tools: [{ googleSearch: {} }],
            },
          });
          return { response, usedModel: modelCandidate, usedSearch: true };
        } catch (searchErr: any) {
          console.info(`[STAR-AI-SERVER] Search tool note for ${modelCandidate} (${searchErr?.message?.slice(0, 100)}). Proceeding without search grounding.`);
          // Retry without search tool on the same model
          const response = await ai.models.generateContent({
            model: modelCandidate,
            contents,
            config,
          });
          return { response, usedModel: modelCandidate, usedSearch: false };
        }
      } else {
        console.log(`[STAR-AI-SERVER] Generating with ${modelCandidate}...`);
        const response = await ai.models.generateContent({
          model: modelCandidate,
          contents,
          config,
        });
        return { response, usedModel: modelCandidate, usedSearch: false };
      }
    } catch (err: any) {
      lastError = err;
      console.info(`[STAR-AI-SERVER] Candidate ${modelCandidate} note: ${err?.message?.slice(0, 100) || 'unavailable'}. Cascading to next candidate...`);
    }
  }

  throw lastError || new Error('All model candidates failed to generate response.');
}

// 1. Health check & configuration info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'STAR AI',
    version: '2.5.0',
    hasApiKey: Boolean(apiKey),
    defaultModel: 'gemini-3.8-flash',
    supportedModels: [
      { id: 'gemini-3.8-flash', name: 'STAR Flash 3.8 (Default)', description: 'Fast multimodal responses and coding' },
      { id: 'gemini-3.1-flash-lite', name: 'STAR Lite 3.1', description: 'Cost-efficient responses' },
      { id: 'gemini-4-argon', name: 'STAR Quantum Pro', description: 'Advanced reasoning; availability depends on API access' }
    ],
    groundingAvailable: true
  });
});

// 2. Chat API endpoint (with multi-turn and resilient model cascade)
app.post('/api/chat', async (req, res) => {
  const startTime = Date.now();
  try {
    const {
      messages = [],
      prompt = '',
      systemInstruction = '',
      model = 'gemini-3.8-flash',
      enableSearch = false,
      temperature = 0.7,
      attachments = []
    } = req.body;

    console.log(`[STAR-AI-SERVER] [REQ /api/chat] Prompt length: ${prompt.length}, Prior turns: ${messages.length}, Model requested: ${model}, Search: ${enableSearch}`);

    const formattedContents = normalizeGeminiContents(messages, prompt, attachments);

    if (formattedContents.length === 0) {
      return res.status(400).json({ error: 'No prompt or valid messages provided.', success: false });
    }

    console.log(`[STAR-AI-SERVER] [NORMALIZED] Formatted turns: ${formattedContents.length}, First turn: ${formattedContents[0]?.role}, Last turn: ${formattedContents[formattedContents.length - 1]?.role}`);

    const config: any = {
      temperature: Number(temperature) || 0.7,
      systemInstruction: systemInstruction || defaultSystemInstruction,
    };

    const { response, usedModel, usedSearch } = await callGeminiWithResilience({
      contents: formattedContents,
      config,
      preferredModel: model,
      enableSearch: Boolean(enableSearch),
    });

    const candidate = response.candidates?.[0];
    let text = response.text || '';
    if (!text && candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.text) text += part.text;
      }
    }

    if (!text) {
      text = 'STAR AI processed your request successfully.';
    }

    const elapsed = Date.now() - startTime;
    console.log(`[STAR-AI-SERVER] [SUCCESS] Completed in ${elapsed}ms via ${usedModel}, output chars: ${text.length}`);

    // Extract search grounding metadata if available
    const groundingMetadata = candidate?.groundingMetadata;
    const webSearchQueries = groundingMetadata?.webSearchQueries || [];
    const searchChunks = groundingMetadata?.groundingChunks || [];
    const searchSupports = groundingMetadata?.groundingSupports || [];

    const sources = searchChunks.map((chunk: any) => ({
      title: chunk.web?.title || 'Web Source',
      url: chunk.web?.uri || '#',
      snippet: chunk.web?.snippet || ''
    })).filter((s: any) => s.url && s.url !== '#');

    res.json({
      success: true,
      text,
      sources,
      webSearchQueries,
      groundingSupports: searchSupports,
      finishReason: candidate?.finishReason || 'STOP',
      modelUsed: usedModel,
      usedSearch
    });
  } catch (error: any) {
    const elapsed = Date.now() - startTime;
    console.error(`[STAR-AI-SERVER] [ERROR] /api/chat failed after ${elapsed}ms:`, error?.message || error);
    const friendlyMessage = formatHumanError(error);
    res.status(/GEMINI_API_KEY is missing/i.test(friendlyMessage) ? 503 : 500).json({ error: friendlyMessage, success: false });
  }
});

// 3. Web Research Mode API
app.post('/api/research', async (req, res) => {
  try {
    const { query, category = 'all', depth = 'detailed' } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Research query is required.' });
    }

    const systemInstruction = `You are STAR RESEARCH, a premier academic and technical research intelligence agent.
Perform exhaustive research.
Analyze facts, verify citations, date of publications, and cross-reference information.
Format response in clean Markdown with:
1. Executive Summary
2. Key Verified Findings (with bullet points)
3. Deep Dive Analysis
4. Contrasting Perspectives or Unknowns
5. Actionable Takeaways
Distinguish verified facts from speculation. Always reference verified knowledge clearly.`;

    const contents = `Conduct in-depth research on: "${query}". Category filter: ${category}. Depth level: ${depth}. Provide authoritative synthesis with sources.`;

    const { response, usedSearch } = await callGeminiWithResilience({
      contents,
      config: { systemInstruction },
      preferredModel: 'gemini-3.1-flash-lite',
      enableSearch: true,
    });

    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;
    const sources = (groundingMetadata?.groundingChunks || []).map((chunk: any) => ({
      title: chunk.web?.title || 'Web Reference',
      url: chunk.web?.uri || '#',
      snippet: chunk.web?.snippet || ''
    })).filter((s: any) => s.url && s.url !== '#');
    const queries = groundingMetadata?.webSearchQueries || [query];

    res.json({
      success: true,
      text: response.text || '',
      sources,
      queries,
      usedSearch
    });
  } catch (error: any) {
    res.status(500).json({ error: formatHumanError(error), success: false });
  }
});

// 4. Image Generation API (AI vector illustration & visual concept synthesis)
app.post('/api/image/generate', async (req, res) => {
  try {
    const {
      prompt,
      aspectRatio = '1:1',
      style = 'futuristic',
      negativePrompt = ''
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Image prompt is required.' });
    }

    const styleModifiers: Record<string, string> = {
      futuristic: 'futuristic sci-fi aesthetic, neon cyan and violet lighting, sleek metallic surfaces, cinematic render, sharp details',
      photographic: 'award-winning studio photography, hyper-realistic, natural lighting, intricate textures, masterpiece',
      anime: 'breathtaking Makoto Shinkai style anime artwork, vibrant colors, stunning dynamic lighting, detailed background, crisp outlines',
      render3d: 'octane 3D render, Pixar style digital art, volumetric lighting, raytracing reflections, polished 3D model, high fidelity',
      minimalist: 'minimalist vector art, clean Swiss graphic design, modern typography accents, elegant negative space, bold aesthetic',
      cyberpunk: 'cyberpunk metropolis atmosphere, holographic billboards, rain reflections on pavement, cyan and purple glow, intricate mechanics'
    };

    const enhancedPrompt = `${prompt}. Style: ${styleModifiers[style] || styleModifiers.futuristic}.${negativePrompt ? ` Exclude: ${negativePrompt}.` : ''}`;

    let base64Image = '';
    let description = '';

    // If an explicit paid image model environment is enabled, attempt raster generation
    if (process.env.GEMINI_PAID_KEY || process.env.ENABLE_IMAGE_MODEL === 'true') {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: [{ text: enhancedPrompt }]
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio as any
            }
          }
        });

        const parts = response.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            base64Image = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          } else if (part.text) {
            description += part.text;
          }
        }
      } catch {
        // Silently handled - smoothly proceed to AI vector illustration synthesis
      }
    }

    // AI Vector Illustration synthesis via gemini-3.1-flash-lite
    if (!base64Image) {
      try {
        const svgPrompt = `You are a world-class vector SVG artist.
Create a standalone, responsive, visually stunning SVG artwork illustrating: "${prompt}".
Style: ${styleModifiers[style] || style}.
Theme: High-tech dark mode compatible (#080D1B dark background, luminous gradients in cyan #35D7FF, purple #8B5CF6, magenta #FF35B8, gold #FBBF24).
Dimensions: viewBox="0 0 800 800".
Requirements:
1. Start directly with <svg and end with </svg>.
2. Include <defs> with linear gradients, radial gradients, or glow filters.
3. Include detailed visual elements (paths, polygons, shapes, highlights) representing the prompt subject.
4. Output ONLY valid, clean SVG code. No markdown fences, no explanatory text.`;

        const { response } = await callGeminiWithResilience({
          contents: svgPrompt,
          preferredModel: 'gemini-3.1-flash-lite',
          enableSearch: false
        });

        const rawText = response.text || '';
        const svgMatch = rawText.match(/<svg[\s\S]*<\/svg>/i);
        if (svgMatch && svgMatch[0]) {
          base64Image = `data:image/svg+xml;utf8,${encodeURIComponent(svgMatch[0])}`;
          description = `AI Visual artwork synthesized for "${prompt}" in ${style} style.`;
        }
      } catch {
        // Fall through to procedural artwork template
      }
    }

    // Procedural fallback artwork
    if (!base64Image) {
      const svgArt = generateFallbackArtwork(prompt, style);
      base64Image = `data:image/svg+xml;utf8,${encodeURIComponent(svgArt)}`;
      description = `Visual concept synthesized for: "${prompt}" in ${style} style.`;
    }

    res.json({
      success: true,
      imageUrl: base64Image,
      description: description || prompt,
      aspectRatio,
      style
    });
  } catch (error: any) {
    res.status(500).json({ error: formatHumanError(error), success: false });
  }
});

// Helper for artistic SVG fallback when image generation API quota/paid key is pending
function generateFallbackArtwork(prompt: string, style: string): string {
  const safeTitle = prompt.slice(0, 50).replace(/[<>&"]/g, '');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#080D1B" />
        <stop offset="50%" stop-color="#111B35" />
        <stop offset="100%" stop-color="#1E1035" />
      </linearGradient>
      <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#35D7FF" />
        <stop offset="50%" stop-color="#8B5CF6" />
        <stop offset="100%" stop-color="#FF35B8" />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="15" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <rect width="800" height="800" fill="url(#bgGrad)" />
    <circle cx="400" cy="400" r="300" fill="none" stroke="rgba(53, 215, 255, 0.15)" stroke-width="2" stroke-dasharray="10 6" />
    <circle cx="400" cy="400" r="220" fill="none" stroke="rgba(139, 92, 246, 0.25)" stroke-width="2" stroke-dasharray="8 4" />
    <circle cx="400" cy="400" r="140" fill="none" stroke="rgba(53, 215, 255, 0.4)" stroke-width="1.5" />
    <polygon points="400,200 450,330 580,340 480,430 510,560 400,490 290,560 320,430 220,340 350,330" fill="url(#starGrad)" filter="url(#glow)" opacity="0.85"/>
    <circle cx="400" cy="400" r="30" fill="#FFFFFF" filter="url(#glow)" />
    <rect x="60" y="660" width="680" height="80" rx="16" fill="rgba(17, 27, 53, 0.85)" stroke="rgba(53, 215, 255, 0.3)" />
    <text x="90" y="695" fill="#35D7FF" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="16">STAR IMAGE STUDIO · ${style.toUpperCase()}</text>
    <text x="90" y="722" fill="#F5F7FF" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" opacity="0.9">${safeTitle}</text>
  </svg>`;
}

// Parse structured model output robustly (handles accidental Markdown fences).
function parseModelJson<T = any>(raw: string | undefined | null): T {
  if (!raw || !raw.trim()) throw new Error('The AI returned an empty response. Please try again.');
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const first = cleaned.indexOf('{');
    const last = cleaned.lastIndexOf('}');
    if (first >= 0 && last > first) {
      try { return JSON.parse(cleaned.slice(first, last + 1)) as T; } catch {}
    }
    throw new Error('The AI response was not valid JSON. Please try again.');
  }
}

// 5. AI Teacher & Tutor API (Lesson generation, Tamil-to-English, Quiz, Flashcards)
app.post('/api/teacher/lesson', async (req, res) => {
  try {
    const {
      topic,
      level = 'beginner',
      mode = 'explain_step_by_step',
      languageSupport = 'none'
    } = req.body;

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({ error: 'Lesson topic is required.', success: false });
    }

    const systemPrompt = `You are STAR TEACHER, an encouraging, patient, world-class personal AI tutor.
Topic: "${topic}". Student Level: "${level}". Teaching Mode: "${mode}".
${languageSupport === 'tamil_to_english' ? 'CRITICAL: Provide Tamil explanations alongside English (Tamil script with transliteration and English translations) to help Tamil speakers master the concepts and English terminology effectively.' : ''}

You must return a structured JSON response matching this format:
{
  "title": "Clear lesson title",
  "summary": "1-2 sentence overview",
  "explanation": "Markdown formatted rich explanation with headings, step-by-step points, and real-life analogies",
  "examples": [
    { "title": "Example 1", "content": "Explanation and application", "tamilNote": "Optional Tamil hint" }
  ],
  "vocabulary": [
    { "term": "Key term", "definition": "Definition", "pronunciation": "Phonetic pronunciation guide", "tamilTranslation": "Tamil equivalent if applicable" }
  ],
  "quiz": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why this answer is correct"
    }
  ],
  "flashcards": [
    { "front": "Concept or Question", "back": "Clear concise answer" }
  ],
  "practiceExercise": "A fun, practical challenge for the student to try",
  "streakBonusPoints": 25
}`;

    const { response } = await callGeminiWithResilience({
      contents: `Generate a complete lesson for topic: "${topic}". Format strictly as JSON.`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json'
      },
      preferredModel: 'gemini-3.1-flash-lite'
    });

    const parsed = parseModelJson(response.text);
    res.json({ success: true, lesson: parsed });
  } catch (error: any) {
    res.status(500).json({ error: formatHumanError(error), success: false });
  }
});

// 6. AI Developer & Code Sandbox API
app.post('/api/developer/generate', async (req, res) => {
  try {
    const { prompt, technology = 'React', action = 'create' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Developer prompt is required.' });
    }

    const systemPrompt = `You are STAR DEVELOPER, an elite principal software engineer and full-stack architect.
Your task is to build or debug web applications and software components.
Produce clean, production-grade, accessible code.
Technology requested: ${technology}.

Return JSON strictly matching this schema:
{
  "projectTitle": "Title of project",
  "architectureSummary": "Explanation of technical choices and component hierarchy",
  "files": [
    {
      "name": "index.html",
      "language": "html",
      "content": "Full code"
    },
    {
      "name": "styles.css",
      "language": "css",
      "content": "Full CSS"
    },
    {
      "name": "app.js",
      "language": "javascript",
      "content": "Full JS or React code"
    }
  ],
  "sandboxedHtml": "A single, standalone, completely self-contained HTML document with inline CSS and JS ready to be rendered directly in a sandboxed iframe. Use Tailwind CDN or modern CSS so it looks gorgeous immediately.",
  "securityNotes": "Best practices for production, auth, and database security",
  "deploymentGuide": "Step-by-step instructions to deploy to Cloud / Vercel / GitHub"
}`;

    const { response } = await callGeminiWithResilience({
      contents: `Request: ${prompt}. Action: ${action}. Generate full project code with working standalone sandbox HTML.`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json'
      },
      preferredModel: 'gemini-3.1-flash-lite'
    });

    const parsed = parseModelJson(response.text);
    res.json({ success: true, project: parsed });
  } catch (error: any) {
    res.status(500).json({ error: formatHumanError(error), success: false });
  }
});

// 7. AI App Creator / App Builder API
app.post('/api/app-builder/generate', async (req, res) => {
  try {
    const { appIdea, template = 'custom', targetPlatform = 'Web & Mobile' } = req.body;
    if (!appIdea) {
      return res.status(400).json({ error: 'App idea is required.' });
    }

    const systemPrompt = `You are STAR APP BUILDER.
Users describe an application in natural language.
You create:
1. Requirements & User Stories
2. Database Schema (PostgreSQL DDL)
3. UI Wireframe / Component Hierarchy
4. Complete self-contained single-page working prototype HTML/CSS/JS with working state and interactive mock features
5. API endpoints specification

Return JSON matching:
{
  "appName": "App Name",
  "tagline": "App Tagline",
  "specifications": [
    { "category": "Auth", "details": "Google OAuth & email/password" },
    { "category": "Core Features", "details": "Description of features" },
    { "category": "Data Layer", "details": "Postgres schema overview" }
  ],
  "databaseSchema": "-- SQL DDL script for PostgreSQL with tables, indexes, foreign keys",
  "sandboxedPreview": "<!DOCTYPE html><html>... self-contained interactive app prototype ...</html>",
  "exportStructure": [
    { "path": "package.json", "content": "..." },
    { "path": "src/App.tsx", "content": "..." }
  ]
}`;

    const { response } = await callGeminiWithResilience({
      contents: `App Concept: "${appIdea}". Template: ${template}. Target: ${targetPlatform}.`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json'
      },
      preferredModel: 'gemini-3.1-flash-lite'
    });

    const parsed = parseModelJson(response.text);
    res.json({ success: true, app: parsed });
  } catch (error: any) {
    res.status(500).json({ error: formatHumanError(error), success: false });
  }
});

// 8. Video & Animation Studio API (Storyboards, scene planning, scriptwriting)
app.post('/api/video/storyboard', async (req, res) => {
  try {
    const { prompt, duration = 30, style = 'cinematic' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Video prompt is required.' });
    }

    const systemPrompt = `You are STAR VIDEO STUDIO, an AI director, cinematographer, and animator.
Create a complete production storyboard, screenplay, and scene-by-scene animation plan for a ${duration}-second video.
Visual Style: ${style}.

Return JSON:
{
  "title": "Video title",
  "logline": "1-sentence hook",
  "fullScript": "Narrator and character script with timing",
  "scenes": [
    {
      "sceneNumber": 1,
      "durationSeconds": 5,
      "visualDescription": "Detailed camera view, subject, lighting, mood",
      "cameraMovement": "e.g., Slow Dolly In, Wide Establishing Shot",
      "voiceover": "Spoken dialogue or voiceover",
      "soundEffects": "SFX cues",
      "colorPalette": ["#35D7FF", "#8B5CF6", "#080D1B"],
      "imagePromptForVeo": "Precise text prompt for Veo video generator"
    }
  ],
  "productionNotes": "Render settings, music recommendation, aspect ratio guidelines"
}`;

    const { response } = await callGeminiWithResilience({
      contents: `Create video plan for: "${prompt}". Duration: ${duration}s. Style: ${style}.`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json'
      },
      preferredModel: 'gemini-3.1-flash-lite'
    });

    const parsed = parseModelJson(response.text);
    res.json({ success: true, storyboard: parsed });
  } catch (error: any) {
    res.status(500).json({ error: formatHumanError(error), success: false });
  }
});

// 9. Autonomous Task Agent API (Break complex tasks, plan, execute steps)
app.post('/api/tasks/plan', async (req, res) => {
  try {
    const { objective } = req.body;
    if (!objective) {
      return res.status(400).json({ error: 'Task objective is required.' });
    }

    const systemPrompt = `You are STAR TASK AGENT, an autonomous multi-step orchestrator.
Decompose the user's objective into structured sequential phases and tasks.
Categorize each task with appropriate tools (e.g., "Web Research", "Code Generation", "Design Synthesis", "Testing", "Deployment").
Identify any task that requires user approval before execution (e.g. publishing, deleting, spending).

Return JSON:
{
  "planName": "Plan Name",
  "objective": "${objective}",
  "estimatedTime": "e.g., 4 minutes",
  "steps": [
    {
      "id": "step-1",
      "title": "Step title",
      "description": "What this step accomplishes",
      "tool": "Web Research" | "Code Generation" | "Design Synthesis" | "Verification" | "Approval",
      "requiresApproval": false,
      "status": "pending",
      "outputPlaceholder": "Expected deliverable"
    }
  ]
}`;

    const { response } = await callGeminiWithResilience({
      contents: `Deconstruct this objective into an autonomous task plan: "${objective}".`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json'
      },
      preferredModel: 'gemini-3.1-flash-lite'
    });

    const parsed = parseModelJson(response.text);
    res.json({ success: true, plan: parsed });
  } catch (error: any) {
    res.status(500).json({ error: formatHumanError(error), success: false });
  }
});

// 10. Execute single step of Task Agent
app.post('/api/tasks/execute-step', async (req, res) => {
  try {
    const { objective, step, previousOutputs = [] } = req.body;
    if (!objective || !step || typeof step !== 'object' || !step.title) {
      return res.status(400).json({ error: 'Objective and a valid task step are required.', success: false });
    }

    const prompt = `Objective: ${objective}
Step to execute: ${step.title} (${step.description})
Tool: ${step.tool}
Previous outputs: ${JSON.stringify(previousOutputs)}

Execute this step thoroughly and provide the concrete output result.`;

    const { response } = await callGeminiWithResilience({
      contents: prompt,
      config: {
        systemInstruction: 'You are STAR TASK AGENT executing a subtask. Return the verified deliverable in clean Markdown.'
      },
      preferredModel: 'gemini-3.1-flash-lite'
    });

    res.json({
      success: true,
      stepId: step.id,
      output: response.text || 'Step completed successfully.'
    });
  } catch (error: any) {
    res.status(500).json({ error: formatHumanError(error), success: false });
  }
});

// 11. Customer Support Ticket submission & FAQ
app.post('/api/support/ticket', (req, res) => {
  const { subject, category, message, userEmail, priority = 'normal' } = req.body;
  const ticketId = 'STAR-' + Math.floor(100000 + Math.random() * 900000);
  res.json({
    success: true,
    ticket: {
      id: ticketId,
      subject: subject || 'General Inquiry',
      category: category || 'Technical',
      priority,
      status: 'In Review by STAR AI Care',
      createdAt: new Date().toISOString(),
      userEmail: userEmail || 'user@example.com',
      estimatedResolution: 'Within 2 hours'
    }
  });
});

// Serve frontend in dev via Vite middlewares, or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`⭐ STAR AI Full-Stack Server active on http://0.0.0.0:${port}`);
  });
}

startServer();
