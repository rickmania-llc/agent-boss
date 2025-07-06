import { Middleware } from 'redux';
import { socket } from '../../services/socket.service';
import * as types from '../actions/types';

export const socketMiddleware: Middleware = store => {
  socket.on('connect', () => {
    store.dispatch({ type: types.SOCKET_CONNECT });
  });

  socket.on('disconnect', () => {
    store.dispatch({ type: types.SOCKET_DISCONNECT });
  });

  socket.on('agent:created', agent => {
    store.dispatch({ type: types.AGENT_CREATED, payload: agent });
  });

  socket.on('agent:started', data => {
    store.dispatch({ type: types.AGENT_STARTED, payload: data });
  });

  socket.on('agent:stopped', data => {
    store.dispatch({ type: types.AGENT_STOPPED, payload: data });
  });

  return next => action => {
    return next(action);
  };
};
