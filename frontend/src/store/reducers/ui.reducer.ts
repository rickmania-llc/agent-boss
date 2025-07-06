import * as types from '../actions/types';

interface UIState {
  loading: boolean;
  error: string | null;
  socketConnected: boolean;
}

const initialState: UIState = {
  loading: false,
  error: null,
  socketConnected: false,
};

export default function uiReducer(state = initialState, action: any): UIState {
  switch (action.type) {
    case types.SET_LOADING:
      return { ...state, loading: action.payload };

    case types.SET_ERROR:
      return { ...state, error: action.payload };

    case types.CLEAR_ERROR:
      return { ...state, error: null };

    case types.SOCKET_CONNECT:
      return { ...state, socketConnected: true };

    case types.SOCKET_DISCONNECT:
      return { ...state, socketConnected: false };

    default:
      return state;
  }
}
