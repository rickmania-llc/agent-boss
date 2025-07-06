import { apiClient } from './api.service';
import { WorkItem } from '../utils/types';

export const fetchWorkItems = async (): Promise<WorkItem[]> => {
  const response = await apiClient.get('/work-items');
  return response.data;
};

export const fetchWorkItem = async (id: number): Promise<WorkItem> => {
  const response = await apiClient.get(`/work-items/${id}`);
  return response.data;
};

export const createWorkItem = async (workItem: Omit<WorkItem, 'id'>): Promise<WorkItem> => {
  const response = await apiClient.post('/work-items', workItem);
  return response.data;
};

export const updateWorkItem = async (id: number, updates: Partial<WorkItem>): Promise<WorkItem> => {
  const response = await apiClient.put(`/work-items/${id}`, updates);
  return response.data;
};

export const assignWorkItem = async (id: number, agentId: number): Promise<void> => {
  await apiClient.post(`/work-items/${id}/assign`, { agentId });
};

export const completeWorkItem = async (id: number): Promise<void> => {
  await apiClient.post(`/work-items/${id}/complete`);
};

export const failWorkItem = async (id: number): Promise<void> => {
  await apiClient.post(`/work-items/${id}/fail`);
};
