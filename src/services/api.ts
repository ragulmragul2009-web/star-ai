import {
  ChatMessage,
  TeacherLesson,
  DeveloperProject,
  AppBuilderResult,
  GeneratedImage,
  VideoStoryboard,
  TaskPlan,
  SupportTicket
} from '../types';

/**
 * Custom error class with rich HTTP & Gemini API diagnostics.
 */
export class StarApiError extends Error {
  status: number;
  isMissingApiKey: boolean;
  isQuotaExceeded: boolean;
  isNetworkError: boolean;

  constructor(message: string, status: number = 0, isNetworkError: boolean = false) {
    super(message);
    this.name = 'StarApiError';
    this.status = status;
    this.isNetworkError = isNetworkError;
    this.isMissingApiKey = status === 503 || /GEMINI_API_KEY is missing/i.test(message);
    this.isQuotaExceeded = status === 429 || /RESOURCE_EXHAUSTED|quota/i.test(message);
  }
}

interface RequestOptions extends RequestInit {
  retries?: number;
  backoffMs?: number;
  timeoutMs?: number;
}

/**
 * Robust fetch wrapper that handles:
 * - Exponential backoff retries for transient errors (429, 500, 502, 503, 504, network failure)
 * - Non-retriable handling for 400, 401, 403, and AbortErrors
 * - Request timeouts with linked AbortControllers
 * - Clean human-friendly error extraction
 */
async function requestWithRetry<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const {
    retries = 2,
    backoffMs = 800,
    timeoutMs = 60000,
    signal: externalSignal,
    ...fetchOptions
  } = options;

  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt <= retries) {
    // If external caller aborted, bail immediately without retrying
    if (externalSignal?.aborted) {
      const abortErr = new Error('The operation was aborted.');
      abortErr.name = 'AbortError';
      throw abortErr;
    }

    // Set up internal timeout combined with external signal
    const timeoutController = new AbortController();
    const timerId = setTimeout(() => {
      timeoutController.abort(new Error(`Request timed out after ${timeoutMs / 1000}s`));
    }, timeoutMs);

    const onExternalAbort = () => {
      timeoutController.abort(externalSignal?.reason);
    };

    if (externalSignal) {
      externalSignal.addEventListener('abort', onExternalAbort, { once: true });
    }

    try {
      const res = await fetch(url, {
        ...fetchOptions,
        signal: timeoutController.signal,
      });

      clearTimeout(timerId);
      if (externalSignal) {
        externalSignal.removeEventListener('abort', onExternalAbort);
      }

      // Check HTTP status
      if (!res.ok) {
        let errMessage = `HTTP error ${res.status}`;
        try {
          const errorData = await res.json();
          if (errorData?.error) {
            errMessage = typeof errorData.error === 'string' ? errorData.error : errorData.error.message || errMessage;
          } else if (errorData?.message) {
            errMessage = errorData.message;
          }
        } catch {
          // Response body was not JSON
        }

        // Determine friendly error message
        if (res.status === 503 && /GEMINI_API_KEY/i.test(errMessage)) {
          throw new StarApiError(
            'GEMINI_API_KEY is missing from environment secrets. Please configure it in your environment settings and restart the app.',
            503
          );
        }

        if (res.status === 429) {
          throw new StarApiError(
            'Gemini API quota rate limit reached. Retrying automatically...',
            429
          );
        }

        const apiErr = new StarApiError(errMessage, res.status);

        // Retriable statuses: 429, 500, 502, 503 (if transient), 504
        const isRetriable = [429, 500, 502, 504].includes(res.status) || (res.status === 503 && !apiErr.isMissingApiKey);

        if (isRetriable && attempt < retries) {
          lastError = apiErr;
          attempt++;
          const delay = backoffMs * Math.pow(2, attempt - 1) + Math.random() * 200;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        throw apiErr;
      }

      // Parse JSON response safely
      const data = await res.json();
      return data as T;
    } catch (err: any) {
      clearTimeout(timerId);
      if (externalSignal) {
        externalSignal.removeEventListener('abort', onExternalAbort);
      }

      // Never retry on explicit aborts from the user
      if (err.name === 'AbortError' || externalSignal?.aborted) {
        throw err;
      }

      // Don't retry non-retriable StarApiErrors (e.g. 400 Bad Request, 403 Forbidden, 503 Missing API Key)
      if (err instanceof StarApiError && (![429, 500, 502, 504].includes(err.status) || err.isMissingApiKey)) {
        throw err;
      }

      lastError = err;
      attempt++;

      if (attempt <= retries) {
        const delay = backoffMs * Math.pow(2, attempt - 1) + Math.random() * 200;
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        break;
      }
    }
  }

  if (lastError instanceof StarApiError) {
    throw lastError;
  }

  throw new StarApiError(
    lastError?.message || 'Network request failed. Please check your internet connection.',
    0,
    true
  );
}

export const StarApi = {
  // Check health and model status
  async checkHealth() {
    try {
      return await requestWithRetry<{
        status: string;
        appName: string;
        version: string;
        hasApiKey: boolean;
        defaultModel: string;
        supportedModels: Array<{ id: string; name: string; description: string }>;
        groundingAvailable: boolean;
      }>('/api/health', { method: 'GET', retries: 1, timeoutMs: 5000 });
    } catch {
      return {
        status: 'offline',
        appName: 'STAR AI',
        version: '2.5.0',
        hasApiKey: false,
        defaultModel: 'gemini-3.8-flash',
        supportedModels: [],
        groundingAvailable: false
      };
    }
  },

  // Main multimodal chat with optional web search grounding, explanation level, and language
  async sendChat({
    messages,
    prompt,
    systemInstruction,
    model = 'gemini-3.8-flash',
    enableSearch = false,
    temperature = 0.7,
    attachments = [],
    explanationLevel = 'normal',
    preferredLanguage = 'en',
    signal
  }: {
    messages?: ChatMessage[];
    prompt: string;
    systemInstruction?: string;
    model?: string;
    enableSearch?: boolean;
    temperature?: number;
    attachments?: any[];
    explanationLevel?: 'basic' | 'normal' | 'advanced';
    preferredLanguage?: string;
    signal?: AbortSignal;
  }) {
    return await requestWithRetry<{
      success: boolean;
      text: string;
      sources?: Array<{ title: string; url: string; snippet?: string }>;
      webSearchQueries?: string[];
      groundingSupports?: any[];
      finishReason?: string;
      modelUsed?: string;
      usedSearch?: boolean;
    }>('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      retries: 2,
      timeoutMs: 65000,
      body: JSON.stringify({
        messages,
        prompt,
        systemInstruction,
        model,
        enableSearch,
        temperature,
        attachments,
        explanationLevel,
        preferredLanguage
      }),
    });
  },

  // Web research with Google Search Grounding
  async performResearch(query: string, category = 'all', depth = 'detailed') {
    return await requestWithRetry<{
      text: string;
      sources: Array<{ title: string; url: string; snippet?: string }>;
      queries: string[];
    }>('/api/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      retries: 2,
      timeoutMs: 60000,
      body: JSON.stringify({ query, category, depth }),
    });
  },

  // Image Studio text-to-image
  async generateImage(
    prompt: string,
    aspectRatio = '1:1',
    style = 'futuristic',
    negativePrompt = ''
  ): Promise<{ imageUrl: string; description: string }> {
    return await requestWithRetry<{ imageUrl: string; description: string }>('/api/image/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      retries: 1,
      timeoutMs: 45000,
      body: JSON.stringify({ prompt, aspectRatio, style, negativePrompt }),
    });
  },

  // AI Teacher lesson generator
  async generateLesson(
    topic: string,
    level = 'beginner',
    mode = 'explain_step_by_step',
    languageSupport = 'none'
  ): Promise<{ lesson: TeacherLesson }> {
    return await requestWithRetry<{ lesson: TeacherLesson }>('/api/teacher/lesson', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      retries: 2,
      timeoutMs: 60000,
      body: JSON.stringify({ topic, level, mode, languageSupport }),
    });
  },

  // AI Teacher evaluate student solution
  async evaluateAnswer({
    lessonTopic,
    practiceExercise,
    studentAnswer,
    level = 'beginner'
  }: {
    lessonTopic: string;
    practiceExercise: string;
    studentAnswer: string;
    level?: string;
  }): Promise<{ evaluation: any }> {
    return await requestWithRetry<{ evaluation: any }>('/api/teacher/evaluate-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      retries: 2,
      timeoutMs: 50000,
      body: JSON.stringify({ lessonTopic, practiceExercise, studentAnswer, level }),
    });
  },

  // AI Teacher ask follow-up in context
  async askTeacherFollowup({
    lessonTopic,
    lessonSummary,
    question
  }: {
    lessonTopic: string;
    lessonSummary: string;
    question: string;
  }): Promise<{ answer: string }> {
    return await requestWithRetry<{ answer: string }>('/api/teacher/follow-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      retries: 2,
      timeoutMs: 50000,
      body: JSON.stringify({ lessonTopic, lessonSummary, question }),
    });
  },

  // Admin telemetry and access verification
  async checkAdminTelemetry(role: string): Promise<any> {
    return await requestWithRetry<any>('/api/admin/telemetry', {
      method: 'GET',
      headers: {
        'x-user-role': role
      },
      retries: 1,
      timeoutMs: 15000,
    });
  },

  // AI Developer project generator
  async generateCode(prompt: string, technology = 'React', action = 'create'): Promise<{ project: DeveloperProject }> {
    return await requestWithRetry<{ project: DeveloperProject }>('/api/developer/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      retries: 2,
      timeoutMs: 70000,
      body: JSON.stringify({ prompt, technology, action }),
    });
  },

  // AI App Builder prototype generator
  async buildApp(
    appIdea: string,
    template = 'custom',
    targetPlatform = 'Web & Mobile'
  ): Promise<{ app: AppBuilderResult }> {
    return await requestWithRetry<{ app: AppBuilderResult }>('/api/app-builder/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      retries: 2,
      timeoutMs: 75000,
      body: JSON.stringify({ appIdea, template, targetPlatform }),
    });
  },

  // Video Studio storyboard generator
  async generateStoryboard(
    prompt: string,
    duration = 30,
    style = 'cinematic'
  ): Promise<{ storyboard: VideoStoryboard }> {
    return await requestWithRetry<{ storyboard: VideoStoryboard }>('/api/video/storyboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      retries: 2,
      timeoutMs: 65000,
      body: JSON.stringify({ prompt, duration, style }),
    });
  },

  // Autonomous Task Planner
  async planTasks(objective: string): Promise<{ plan: TaskPlan }> {
    return await requestWithRetry<{ plan: TaskPlan }>('/api/tasks/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      retries: 2,
      timeoutMs: 60000,
      body: JSON.stringify({ objective }),
    });
  },

  // Execute single task step
  async executeTaskStep(
    objective: string,
    step: any,
    previousOutputs: any[] = []
  ): Promise<{ stepId: string; output: string }> {
    return await requestWithRetry<{ stepId: string; output: string }>('/api/tasks/execute-step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      retries: 2,
      timeoutMs: 60000,
      body: JSON.stringify({ objective, step, previousOutputs }),
    });
  },

  // Support ticket
  async submitTicket(ticketData: {
    subject: string;
    category: string;
    message: string;
    userEmail: string;
    priority?: string;
  }): Promise<{ ticket: SupportTicket }> {
    return await requestWithRetry<{ ticket: SupportTicket }>('/api/support/ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      retries: 1,
      timeoutMs: 15000,
      body: JSON.stringify(ticketData),
    });
  }
};
