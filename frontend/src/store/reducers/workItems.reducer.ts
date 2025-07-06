import * as types from '../actions/types';
import { WorkItem } from '../../utils/types';

interface WorkItemsState {
  items: WorkItem[];
  loading: boolean;
  error: string | null;
}

const initialState: WorkItemsState = {
  items: [],
  loading: false,
  error: null,
};

export default function workItemsReducer(state = initialState, action: any): WorkItemsState {
  switch (action.type) {
    case types.FETCH_WORK_ITEMS_START:
      return { ...state, loading: true, error: null };

    case types.FETCH_WORK_ITEMS_SUCCESS:
      return { ...state, loading: false, items: action.payload };

    case types.FETCH_WORK_ITEMS_ERROR:
      return { ...state, loading: false, error: action.payload };

    case types.CREATE_WORK_ITEM_SUCCESS:
      return { ...state, items: [action.payload, ...state.items] };

    case types.UPDATE_WORK_ITEM_SUCCESS:
      return {
        ...state,
        items: state.items.map(item => (item.id === action.payload.id ? action.payload : item)),
      };

    default:
      return state;
  }
}
