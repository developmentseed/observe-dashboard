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

const tracesReducer = baseAPIReducer('TRACES', tracesReducerInitialState);

/**
 * INDIVIDUAL TRACE reducer
 */
const traceReducerInitialState = {
  // Each entry:
  // fetching: false,
  // fetched: false,
  // error: null,
  // data: []
};

function traceReducer (state = traceReducerInitialState, action) {
  // Update trace action do not use baseAPIReducer
  if (action.type === 'UPDATE_TRACE') {
    // Get item
    const st = Object.assign({}, state[action.id]);

    // Apply changed properties
    st.data.properties = {
      ...st.data.properties,
      ...action.data
    };

    // Return state
    return {
      ...state,
      [action.id]: st
    };
  }

  // Pass action to baseAPIReducer
  return baseAPIReducer('TRACE', traceReducerInitialState)(state, action);
}

/**
 * INDIVIDUAL PHOTO reducer
 */
const photosReducerInitialState = {
  fetching: false,
  fetched: false,
  error: null,
  data: []
};

const photosReducer = baseAPIReducer('PHOTOS', photosReducerInitialState);

/**
 * INDIVIDUAL PHOTO reducer
 */
const photoReducerInitialState = {
  // Each entry:
  // fetching: false,
  // fetched: false,
  // error: null,
  // data: []
};

function photoReducer (state = photoReducerInitialState, action) {
  // Update photo action do not use baseAPIReducer
  if (action.type === 'UPDATE_PHOTO') {
    // Get item
    const st = Object.assign({}, state[action.id]);

    // Apply changed properties
    st.data = {
      ...st.data,
      ...action.data
    };

    // Return state
    return {
      ...state,
      [action.id]: st
    };
  }

  // Pass action to baseAPIReducer
  return baseAPIReducer('PHOTO', photoReducerInitialState)(state, action);
}

/**
 * Export combined reducers
 */
export default combineReducers({
  authenticatedUser: authenticatedUserReducer,
  traces: tracesReducer,
  photos: photosReducer,
  individualTraces: traceReducer,
  individualPhotos: photoReducer
});
