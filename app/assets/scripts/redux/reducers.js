import { combineReducers } from 'redux';
import { baseAPIReducer } from './utils';

/**
 * AUTHENTICATED USER reducer
 */
const authenticatedUserReducerInitialState = {
  fetching: false,
  fetched: false,
  error: null,
  data: {
    loggedIn: false
  }
};

const authenticatedUserReducer = baseAPIReducer(
  'AUTHENTICATED_USER',
  authenticatedUserReducerInitialState
);

/**
 * TRACES reducer
 */
const tracesReducerInitialState = {
  fetching: false,
  fetched: false,
  error: null,
  data: []
};

const tracesReducer = baseAPIReducer(
  'TRACES',
  tracesReducerInitialState
);

/**
 * INDIVIDUAL TRACE reducer
 */
const traceReducerInitialState = {};

const traceReducer = baseAPIReducer(
  'TRACE',
  traceReducerInitialState
);

/**
 * PHOTOS reducer
 */
const photosReducerInitialState = {
  fetching: false,
  fetched: false,
  error: null,
  data: []
};

const photosReducer = baseAPIReducer(
  'PHOTOS',
  photosReducerInitialState
);

/**
 * Export combined reducers
 */
export default combineReducers({
  authenticatedUser: authenticatedUserReducer,
  traces: tracesReducer,
  individualTraces: traceReducer,
  photos: photosReducer
});
