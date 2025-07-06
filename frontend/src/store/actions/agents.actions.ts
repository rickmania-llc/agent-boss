import { Dispatch } from 'redux';
import * as types from './types';
import {
  fetchAgents,
  createAgent as apiCreateAgent,
  stopAgent as apiStopAgent,
} from '../../services/agent.api';

export const loadAgents = () => async (dispatch: Dispatch) => {
  dispatch({ type: types.FETCH_AGENTS_START });
  try {
    const agents = await fetchAgents();
    dispatch({ type: types.FETCH_AGENTS_SUCCESS, payload: agents });
  } catch (error: any) {
    dispatch({ type: types.FETCH_AGENTS_ERROR, payload: error.message });
  }
};

export const createAgent = (name: string) => async (dispatch: Dispatch) => {
  dispatch({ type: types.CREATE_AGENT_START });
  try {
    const agent = await apiCreateAgent(name);
    dispatch({ type: types.CREATE_AGENT_SUCCESS, payload: agent });
    return agent;
  } catch (error: any) {
    dispatch({ type: types.CREATE_AGENT_ERROR, payload: error.message });
    throw error;
  }
};

export const stopAgent = (agentId: number) => async (dispatch: Dispatch) => {
  dispatch({ type: types.STOP_AGENT_START });
  try {
    await apiStopAgent(agentId);
    dispatch({ type: types.STOP_AGENT_SUCCESS, payload: agentId });
  } catch (error: any) {
    dispatch({ type: types.STOP_AGENT_ERROR, payload: error.message });
    throw error;
  }
};
