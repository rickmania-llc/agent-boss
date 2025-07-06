import { combineReducers } from 'redux';
import workItemsReducer from './reducers/workItems.reducer';
import agentsReducer from './reducers/agents.reducer';
import uiReducer from './reducers/ui.reducer';

const rootReducer = combineReducers({
  workItems: workItemsReducer,
  agents: agentsReducer,
  ui: uiReducer,
});

export default rootReducer;
