'use strict';
import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { persistStore } from 'redux-persist';

import { environment } from '../config';
import reducer from '../redux';

const initialState = {};

const logger = createLogger({
  level: 'info',
  collapsed: true,
  predicate: (getState, action) => environment !== 'production'
});

const composeEnhancers =
  environment !== 'production'
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
    : compose;

const middleware = applyMiddleware(
  thunkMiddleware,
  logger
);

const store = createStore(
  reducer,
  initialState,
  composeEnhancers(middleware)
);

const persistor = persistStore(store);
export { store, persistor };
