import get from 'lodash.get';

/**
 * Delays the execution in x milliseconds.
 *
 * @param {int} millis Milliseconds
 */
function delay (millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}

/**
 * Performs a request to the given url returning the response in json format
 * or throwing an error.
 *
 * @param {string} url Url to query
 * @param {object} options Options for fetch
 */
export async function fetchJSON (url, options) {
  let response;
  try {
    response = await fetch(url, options);
    const json = await response.json();

    if (response.status >= 400) {
      const err = new Error(json.message);
      err.statusCode = response.status;
      err.data = json;
      throw err;
    }

    return json;
  } catch (error) {
    error.statusCode = response.status || null;
    throw error;
  }
}

/**
 * Performs a query to the given url dispatching the appropriate actions.
 * If there's data in the state, that is used instead.
 *
 * @param {object} options Options.
 * @param {string} options.statePath Path to where data is on the state.
 * @param {string} options.url Url to query.
 * @param {func} options.requestFn Request action to dispatch.
 * @param {func} options.receiveFn Receive action to dispatch.
 * @param {func} options.mutator Function to change the response before sending
 *                               it to the receive function.
 */
export function fetchDispatchCacheFactory (opts) {
  const { statePath, receiveFn, __devDelay } = opts;
  return async function (dispatch, getState) {
    const pageState = get(getState(), statePath);
    if (pageState && pageState.fetched && !pageState.error) {
      if (__devDelay) await delay(__devDelay);
      return dispatch(receiveFn(pageState.data));
    }

    return fetchDispatchFactory(opts)(dispatch, getState);
  };
}

/**
 * Performs a query to the given url dispatching the appropriate actions.
 * For a version that checks the state use fetchDispatchCacheFactory()
 *
 * @param {object} options Options.
 * @param {string} options.statePath Path to where data is on the state.
 * @param {string} options.url Url to query.
 * @param {func} options.requestFn Request action to dispatch.
 * @param {func} options.receiveFn Receive action to dispatch.
 * @param {func} options.mutator Function to change the response before sending
 *                               it to the receive function.
 */
export function fetchDispatchFactory (opts) {
  let { url, requestFn, receiveFn, mutator, __devDelay } = opts;
  mutator = mutator || (v => v);
  return async function (dispatch, getState) {
    dispatch(requestFn());

    try {
      const response = await fetchJSON(url);
      const content = mutator(response);
      if (__devDelay) await delay(__devDelay);
      return dispatch(receiveFn(content));
    } catch (error) {
      if (__devDelay) await delay(__devDelay);
      console.log('error', url, error); // eslint-disable-line
      return dispatch(receiveFn(null, error));
    }
  };
}

/**
 * Base reducer for an api request, taking into account the action.id
 * If it exists it will store in the state under that path. Allows for
 * page caching.
 *
 * Uses the following actions:
 * - INVALIDATE_<actionName>
 * - REQUEST_<actionName>
 * - RECEIVE_<actionName>
 *
 * @param {object} state The state.
 * @param {object} action The action.
 * @param {string} actionName The action name to use as suffix
 */
export function baseAPIReducer (state, action, actionName) {
  const hasId = typeof action.id !== 'undefined';
  switch (action.type) {
    case `INVALIDATE_${actionName}`:
      return hasId ? { ...state, [action.id]: state } : state;
    case `REQUEST_${actionName}`: {
      const changeReq = {
        fetching: true,
        fetched: false,
        data: {},
        error: null
      };
      return hasId ? { ...state, [action.id]: changeReq } : changeReq;
    }
    case `RECEIVE_${actionName}`: {
      // eslint-disable-next-line prefer-const
      let st = {
        fetching: false,
        fetched: true,
        receivedAt: action.receivedAt,
        data: {},
        error: null
      };

      if (action.error) {
        st.error = action.error;
      } else {
        st.data = action.data;
      }

      return hasId ? { ...state, [action.id]: st } : st;
    }
  }
  return state;
}
