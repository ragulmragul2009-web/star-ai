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

export const StarApi = {
  // Check health and model status
  async checkHealth() {
    try {
      const res = await fetch('/api/health');
      return await res.json();
    } catch {
      return { status: 'offline', hasApiKey: false };
    }
  },

  // Main multimodal chat with optional web search grounding, explanation level, and language
  async sendChat({
    messages,
    prompt,
    systemInstruction,
    model = 'gemini-3.1-flash-lite',
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
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
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
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }
    return await res.json();
  },

  // Web research with Google Search Grounding
  async performResearch(query: string, category = 'all', depth = 'detailed') {
    const res = await fetch('/api/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, category, depth }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Research failed' }));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }
    return await res.json();
  },

  // Image Studio text-to-image
  async generateImage(prompt: string, aspectRatio = '1:1', style = 'futuristic', negativePrompt = ''): Promise<{ imageUrl: string; description: string }> {
    const res = await fetch('/api/image/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, aspectRatio, style, negativePrompt }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Image generation failed' }));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }
    return await res.json();
  },

  // AI Teacher lesson generator
  async generateLesson(topic: string, level = 'beginner', mode = 'explain_step_by_step', languageSupport = 'none'): Promise<{ lesson: TeacherLesson }> {
    const res = await fetch('/api/teacher/lesson', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, level, mode, languageSupport }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Lesson generation failed' }));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }
    return await res.json();
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
    const res = await fetch('/api/teacher/evaluate-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonTopic, practiceExercise, studentAnswer, level }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Evaluation failed' }));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }
    return await res.json();
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
    const res = await fetch('/api/teacher/follow-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonTopic, lessonSummary, question }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Follow-up question failed' }));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }
    return await res.json();
  },

  // Admin telemetry and access verification
  async checkAdminTelemetry(role: string): Promise<any> {
    const res = await fetch('/api/admin/telemetry', {
      headers: {
        'x-user-role': role
      }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Access Denied' }));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }
    return await res.json();
  },

  // AI Developer project generator
  async generateCode(prompt: string, technology = 'React', action = 'create'): Promise<{ project: DeveloperProject }> {
    const res = await fetch('/api/developer/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, technology, action }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Code generation failed' }));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }
    return await res.json();
  },

  // AI App Builder prototype generator
  async buildApp(appIdea: string, template = 'custom', targetPlatform = 'Web & Mobile'): Promise<{ app: AppBuilderResult }> {
    const res = await fetch('/api/app-builder/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appIdea, template, targetPlatform }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'App building failed' }));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }
    return await res.json();
  },

  // Video Studio storyboard generator
  async generateStoryboard(prompt: string, duration = 30, style = 'cinematic'): Promise<{ storyboard: VideoStoryboard }> {
    const res = await fetch('/api/video/storyboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, duration, style }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Storyboard generation failed' }));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }
    return await res.json();
  },

  // Autonomous Task Planner
  async planTasks(objective: string): Promise<{ plan: TaskPlan }> {
    const res = await fetch('/api/tasks/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ objective }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Task planning failed' }));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }
    return await res.json();
  },

  // Execute single task step
  async executeTaskStep(objective: string, step: any, previousOutputs: any[] = []): Promise<{ stepId: string; output: string }> {
    const res = await fetch('/api/tasks/execute-step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ objective, step, previousOutputs }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Step execution failed' }));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }
    return await res.json();
  },

  // Support ticket
  async submitTicket(ticketData: { subject: string; category: string; message: string; userEmail: string; priority?: string }): Promise<{ ticket: SupportTicket }> {
    const res = await fetch('/api/support/ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticketData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Ticket submission failed' }));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }
    return await res.json();
  }
};
