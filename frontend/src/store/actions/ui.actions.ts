import * as types from './types';

export const setLoading = (loading: boolean) => ({
  type: types.SET_LOADING,
  payload: loading,
});

export const setError = (error: string | null) => ({
  type: types.SET_ERROR,
  payload: error,
});

export const clearError = () => ({
  type: types.CLEAR_ERROR,
});
