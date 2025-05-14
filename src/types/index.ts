export interface Candidate {
  name: string;
  title?: string;
  dept?: string;
}

export interface QuestionTimer {
  plannedMin: number;
  elapsedMs: number;
}

export interface QuestionData {
  answer: any;
  notes: string;
  plannedMin: number;
  elapsedMs: number;
  lastUpdated?: string;
}

export interface SessionData {
  plannedMin: number;
  actualMs: number;
  questions: {
    [qid: string]: QuestionData;
  };
}

export interface Rating {
  technical: number;
  communication: number;
  problemSolving: number;
  culturalFit: number;
  overall: number;
}

export interface ReviewData {
  strengths: string[];
  weaknesses: string[];
  redFlags: string[];
  nextSteps: string;
  notes: string;
  rating: Rating;
}

export interface Interview {
  id: string;
  questionnaireHash: string;
  candidate: Candidate;
  startedAt: string;
  finishedAt?: string;
  isPaused?: boolean;
  lastSaved?: string;
  currentSession?: string;
  currentQuestion?: string;
  review?: ReviewData;
  sessions: {
    [sessionId: string]: SessionData;
  };
}

export interface Questionnaire {
  json: any;
  name: string;
  version: string;
  createdAt: string;
  hash: string;
}

export interface StoreState {
  questionnaires: {
    [hash: string]: Questionnaire;
  };
  interviews: {
    [id: string]: Interview;
  };
  currentInterviewId: string | null;
  darkMode: boolean;
  
  // Actions
  setDarkMode: (isDark: boolean) => void;
  addQuestionnaire: (questionnaire: Questionnaire) => void;
  createInterview: (questionnaireHash: string, candidate: Candidate) => string;
  updateInterview: (id: string, data: Partial<Interview>) => void;
  setCurrentInterview: (id: string | null) => void;
  updateAnswer: (sessionId: string, questionId: string, answer: any) => void;
  updateNotes: (sessionId: string, questionId: string, notes: string) => void;
  updateQuestionTime: (sessionId: string, questionId: string, elapsedMs: number) => void;
  updateSessionTime: (sessionId: string, actualMs: number) => void;
  completeInterview: (id: string) => void;
  pauseInterview: (id: string) => void;
  resumeInterview: (id: string) => void;
  exportInterview: (id: string) => Promise<Blob>;
}