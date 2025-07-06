import { apiClient } from './api.service';
import { Agent } from '../utils/types';

export const fetchAgents = async (): Promise<Agent[]> => {
  const response = await apiClient.get('/agents');
  return response.data;
};

export const fetchAgent = async (id: number): Promise<Agent> => {
  const response = await apiClient.get(`/agents/${id}`);
  return response.data;
};

export const createAgent = async (name: string): Promise<Agent> => {
  const response = await apiClient.post('/agents', { name });
  return response.data;
};

export const stopAgent = async (id: number): Promise<void> => {
  await apiClient.post(`/agents/${id}/stop`);
};
