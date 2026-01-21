export type Tool = 'teams' | 'canva' | 'edpuzzle' | 'copilot';
export type Level = 'explorer' | 'practitioner' | 'leader';

export interface LearningPathway {
  tool: Tool;
  level: Level;
  intro: {
    title: string;
    description: string;
    whyItMatters: string[];
    externalLinks?: Array<{
      title: string;
      url: string;
      description: string;
    }>;
    additionalInfo?: string;
  };
  mainContent: {
    howToUse: string;
    examples: string[];
  };
  benefits: {
    students: string[];
    staff: string[];
    college: string[];
  };
  quiz: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export type Department = 
  | 'Apprenticeships'
  | 'Adult Skills'
  | 'Construction'
  | 'Engineering & Motor Vehicle'
  | 'PLW'
  | 'Science and Digital'
  | '14-16 Provision'
  | 'Early Years, Education and Social Care'
  | 'Professional & Creative'
  | 'LDI'
  | 'Other';

export interface Reflection {
  id: string;
  toolName: string;
  level: string;
  text: string;
  author: string;
  department: Department;
  otherDepartment?: string;
  timestamp: number;
}

export interface Progress {
  currentStep: number;
  completedSteps: string[];
  quizScore?: number;
  badgeEarned?: boolean;
}
