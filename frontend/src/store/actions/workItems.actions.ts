import { Dispatch } from 'redux';
import * as types from './types';
import {
  fetchWorkItems,
  createWorkItem as apiCreateWorkItem,
  updateWorkItem as apiUpdateWorkItem,
} from '../../services/workItem.api';
import { WorkItem } from '../../utils/types';

export const loadWorkItems = () => async (dispatch: Dispatch) => {
  dispatch({ type: types.FETCH_WORK_ITEMS_START });
  try {
    const workItems = await fetchWorkItems();
    dispatch({ type: types.FETCH_WORK_ITEMS_SUCCESS, payload: workItems });
  } catch (error: any) {
    dispatch({ type: types.FETCH_WORK_ITEMS_ERROR, payload: error.message });
  }
};

export const createWorkItem = (workItem: Omit<WorkItem, 'id'>) => async (dispatch: Dispatch) => {
  dispatch({ type: types.CREATE_WORK_ITEM_START });
  try {
    const created = await apiCreateWorkItem(workItem);
    dispatch({ type: types.CREATE_WORK_ITEM_SUCCESS, payload: created });
    return created;
  } catch (error: any) {
    dispatch({ type: types.CREATE_WORK_ITEM_ERROR, payload: error.message });
    throw error;
  }
};

export const updateWorkItem =
  (id: number, updates: Partial<WorkItem>) => async (dispatch: Dispatch) => {
    dispatch({ type: types.UPDATE_WORK_ITEM_START });
    try {
      const updated = await apiUpdateWorkItem(id, updates);
      dispatch({ type: types.UPDATE_WORK_ITEM_SUCCESS, payload: updated });
      return updated;
    } catch (error: any) {
      dispatch({ type: types.UPDATE_WORK_ITEM_ERROR, payload: error.message });
      throw error;
    }
  };
