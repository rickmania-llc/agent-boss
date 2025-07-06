export const WORK_ITEM_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const WORK_ITEM_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export const AGENT_STATUS = {
  IDLE: 'idle',
  BUSY: 'busy',
  ERROR: 'error',
} as const;
