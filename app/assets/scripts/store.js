'use strict';
import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { loadState, saveState } from './utils/local-storage';
import throttle from 'lodash.throttle';

import { environment } from './config';
import reducer from './redux/reducers';

// Load persisted state, if any
const persistedState = loadState();

// Setup middleware composer
const composeEnhancers =
  environment !== 'production'
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
    : compose;

// Add middlewares
const middleware = applyMiddleware(thunkMiddleware);

// Create store
const store = createStore(
  reducer,
  persistedState,
  composeEnhancers(middleware)
);

// Listen to store changes and update auth state once a second
store.subscribe(
  throttle(() => {
    saveState({
      authenticatedUser: store.getState().authenticatedUser
    });
  }, 1000)
);

export default store;
