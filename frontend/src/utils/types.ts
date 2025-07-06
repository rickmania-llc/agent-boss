export interface WorkItem {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: number;
  name: string;
  status: 'idle' | 'busy' | 'error';
  workItemId?: number;
  pid?: number;
}

export interface Phase {
  id: number;
  workItemId: number;
  name: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  orderIndex: number;
}

export interface Revision {
  id: number;
  workItemId: number;
  phaseId?: number;
  content: string;
  type: string;
  created_at: string;
}
