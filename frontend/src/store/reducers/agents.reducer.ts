import * as types from '../actions/types';
import { Agent } from '../../utils/types';

interface AgentsState {
  items: Agent[];
  loading: boolean;
  error: string | null;
}

const initialState: AgentsState = {
  items: [],
  loading: false,
  error: null,
};

export default function agentsReducer(state = initialState, action: any): AgentsState {
  switch (action.type) {
    case types.FETCH_AGENTS_START:
      return { ...state, loading: true, error: null };

    case types.FETCH_AGENTS_SUCCESS:
      return { ...state, loading: false, items: action.payload };

    case types.FETCH_AGENTS_ERROR:
      return { ...state, loading: false, error: action.payload };

    case types.CREATE_AGENT_SUCCESS:
      return { ...state, items: [...state.items, action.payload] };

    case types.AGENT_CREATED:
      return { ...state, items: [...state.items, action.payload] };

    case types.AGENT_STARTED:
      return {
        ...state,
        items: state.items.map(agent =>
          agent.id === action.payload.agentId
            ? { ...agent, status: 'busy', workItemId: action.payload.workItemId }
            : agent
        ),
      };

    case types.AGENT_STOPPED:
      return {
        ...state,
        items: state.items.map(agent =>
          agent.id === action.payload.agentId
            ? { ...agent, status: 'idle', workItemId: undefined }
            : agent
        ),
      };

    default:
      return state;
  }
}
