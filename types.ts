export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
  createdAt: number;
  color: string; // Hex color for visual distinction
}

export enum ProjectFilter {
  ALL = 'ALL',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

export interface AIState {
  isGenerating: boolean;
  error: string | null;
}