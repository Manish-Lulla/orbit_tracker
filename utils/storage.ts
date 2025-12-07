import { Project } from '../types';

const STORAGE_KEY = 'orbit_projects_v1';

export const loadProjects = (): Project[] => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return [];
    return JSON.parse(serialized);
  } catch (e) {
    console.error("Failed to load projects from storage", e);
    return [];
  }
};

export const saveProjects = (projects: Project[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error("Failed to save projects to storage", e);
  }
};

// Generate a random bright color for projects
export const getRandomColor = (): string => {
  const colors = [
    '#6366f1', // Indigo
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#f43f5e', // Rose
    '#10b981', // Emerald
    '#06b6d4', // Cyan
    '#f59e0b', // Amber
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};