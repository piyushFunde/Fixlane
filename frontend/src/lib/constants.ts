export const PRIORITY = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
} as const;

export const STATUS = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
} as const;

export const ROLE = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  DEVELOPER: 'DEVELOPER',
} as const;

export const PRIORITY_LABELS: Record<string, string> = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

export const STATUS_LABELS: Record<string, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

export const REFRESH_TOKEN_KEY = 'fixlane_refresh';
export const APP_NAME = 'Fixlane';
