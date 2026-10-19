export type WorkspaceId =
  | 'chat'
  | 'avatar-live'
  | 'research'
  | 'teacher'
  | 'developer'
  | 'app-builder'
  | 'image-studio'
  | 'video-studio'
  | 'notes'
  | 'tasks'
  | 'support'
  | 'admin'
  | 'settings';

export type AvatarStyle = '3d-human' | 'cyber-hologram' | 'stylized-anime' | 'star-minimal';

export type AvatarState =
  | 'IDLE'
  | 'LISTENING'
  | 'THINKING'
  | 'SPEAKING'
  | 'PROCESSING'
  | 'GENERATING'
  | 'HAPPY'
  | 'ERROR'
  | 'OFFLINE';

export interface Attachment {
  name: string;
  mimeType: string;
  size: number;
  data: string; // base64 string
  type: 'image' | 'audio' | 'video' | 'document';
}

export interface WebSource {
  title: string;
  url: string;
  snippet?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: number;
  attachments?: Attachment[];
  sources?: WebSource[];
  webSearchQueries?: string[];
  modelUsed?: string;
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  pinned?: boolean;
  folder?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface TeacherLesson {
  title: string;
  summary: string;
  explanation: string;
  examples: { title: string; content: string; tamilNote?: string }[];
  vocabulary: { term: string; definition: string; pronunciation?: string; tamilTranslation?: string }[];
  quiz: QuizQuestion[];
  flashcards: Flashcard[];
  practiceExercise: string;
  streakBonusPoints: number;
}

export interface ProjectFile {
  name: string;
  language: string;
  content: string;
}

export interface DeveloperProject {
  projectTitle: string;
  architectureSummary: string;
  files: ProjectFile[];
  sandboxedHtml: string;
  securityNotes?: string;
  deploymentGuide?: string;
}

export interface AppBuilderResult {
  appName: string;
  tagline: string;
  specifications: { category: string; details: string }[];
  databaseSchema: string;
  sandboxedPreview: string;
  exportStructure: { path: string; content: string }[];
}

export interface GeneratedImage {
  id: string;
  prompt: string;
  style: string;
  aspectRatio: string;
  imageUrl: string;
  createdAt: number;
  description?: string;
}

export interface StoryboardScene {
  sceneNumber: number;
  durationSeconds: number;
  visualDescription: string;
  cameraMovement: string;
  voiceover: string;
  soundEffects: string;
  colorPalette: string[];
  imagePromptForVeo: string;
}

export interface VideoStoryboard {
  title: string;
  logline: string;
  fullScript: string;
  scenes: StoryboardScene[];
  productionNotes: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  folder: string;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface TaskStep {
  id: string;
  title: string;
  description: string;
  tool: string;
  requiresApproval: boolean;
  status: 'pending' | 'in_progress' | 'waiting_approval' | 'completed' | 'failed';
  output?: string;
}

export interface TaskPlan {
  planName: string;
  objective: string;
  estimatedTime: string;
  steps: TaskStep[];
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: string;
  createdAt: string;
  userEmail: string;
  estimatedResolution: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'developer' | 'educator' | 'admin';
  avatarStyle: AvatarStyle;
  preferredVoice: string;
  speechSpeed: number;
  autoSpeak: boolean;
  theme: 'dark' | 'light';
  streakDays: number;
  learningPoints: number;
}
