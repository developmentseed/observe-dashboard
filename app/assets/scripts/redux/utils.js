import get from 'lodash.get';
import merge from 'lodash.merge';
import { delay } from '../utils';
import { apiUrl } from '../config';

/**
 * Performs a request to the given url returning the response in json format
 * or throwing an error.
 *
 * @param {string} url Url to query
 * @param {object} options Options for fecth
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
    error.statusCode = response ? response.status || null : null;
    throw error;
  }
}

/**
 * Performs a patch request using accessToken from state.
 *
 * @param {object} state Application state
 * @param {string} type Item
 * @param {string} url Request URL
 * @param {object} payload Data payload
 */
export async function patchItem (state, type, id, payload) {
  // Get accessToken
  const accessToken = get(state, 'authenticatedUser.data.accessToken');

  // Thrown error if not defined
  if (!accessToken) throw Error('User is not logged in.');

  // Make the request
  const url = `${apiUrl}/${type}/${id}`;

  // Make the request
  await fetchJSON(url, {
    method: 'PATCH',
    headers: {
      Authorization: accessToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

/**
 * Performs a delete request to a trace/photo using accessToken from state.
 *
 * @param {object} state Application state
 * @param {string} type Item type: 'trace' or 'photo'
 * @param {string} id Item id
 */
export async function deleteItem (state, type, id) {
  // Get accessToken
  const accessToken = get(state, 'authenticatedUser.data.accessToken');

  // Thrown error if not defined
  if (!accessToken) throw Error('User is not logged in.');

  // Make the request
  const url = `${apiUrl}/${type}/${id}`;
  await fetchJSON(url, {
    method: 'DELETE',
    headers: {
      Authorization: accessToken
    }
  });
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
 * @param {string} options.options Options for the fetch request.
 *                                 See fetch documentation.
 * @param {func} options.requestFn Request action to dispatch.
 * @param {func} options.receiveFn Receive action to dispatch.
 * @param {func} options.mutator Function to change the response before sending
 *                               it to the receive function.
 * @example
 * function fetchSearchResults (query) {
 *  return fetchDispatchFactory({
 *    statePath: 'searchResults',
 *    url: `${config.api}/search`,
 *    requestFn: requestSearchResults.bind(this),
 *    receiveFn: receiveSearchResults.bind(this)
 *  });
 * }
 *
 * // Example with request options.
 * function fetchSearchResults (query) {
 *  return fetchDispatchFactory({
 *    statePath: 'searchResults',
 *    url: `${config.api}/search`,
 *    options: {
 *      headers: {
 *        'Content-Type': 'application/json'
 *      },
 *      method: 'POST',
 *      body: JSON.stringify(query)
 *    },
 *    requestFn: requestSearchResults.bind(this),
 *    receiveFn: receiveSearchResults.bind(this)
 *  });
 * }
 */
export function fetchDispatchFactory (opts) {
  let { url, requestFn, receiveFn, mutator, options, __devDelay } = opts;
  mutator = mutator || (v => v);
  return async function (dispatch, getState) {
    dispatch(requestFn());

    try {
      const response = await fetchJSON(url, options);
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

export function fetchAuth (opts) {
  return (dispatch, getState) => {
    const {
      authenticatedUser: { data }
    } = getState();

    if (!data || typeof data.osmId === 'undefined') {
      return dispatch(opts.receiveFn(null, new Error('User not logged in.')));
    }

    const { accessToken } = data;

    const options = {
      ...opts,
      options: merge(opts.options, {
        headers: {
          Authorization: accessToken
        }
      })
    };

    return fetchDispatchFactory(options)(dispatch, getState);
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
 *
 * @example
 * const resultsReducer = baseAPIReducer('RESULTS', resultsInitialState);
 */
export function baseAPIReducer (actionName, initial) {
  return (state = initial, action) => {
    const hasId = typeof action.id !== 'undefined';
    switch (action.type) {
      case `INVALIDATE_${actionName}`:
        return hasId ? { ...state, [action.id]: initial } : initial;
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
  };
}

/**
 * Wraps the api result with helpful functions.
 * To be used in the state selector.
 *
 * @param {object} stateData Object as returned from an api request. Expected to
 *                           be in the following format:
 *                           {
 *                             fetched: bool,
 *                             fetching: bool,
 *                             data: object,
 *                             error: null | error
 *                           }
 *
 * @returns {object}
 * {
 *   raw(): returns the data as is.
 *   isReady(): Whether or not the fetching finished and was fetched.
 *   hasError(): Whether the request finished with an error.
 *   getData(): Returns the data. If the data has a results list will return that
 *   getMeta(): If there's a meta object it will be returned
 *
 * As backward compatibility all data properties are accessible directly.
 * }
 */
export function wrapApiResult (stateData) {
  const { fetched, fetching, data, error } = stateData;
  const ready = fetched && !fetching;
  return Object.assign(
    {},
    {
      raw: () => stateData,
      isReady: () => ready,
      hasError: () => ready && !!error,
      getData: (def = {}) => (ready ? data.results || data : def),
      getMeta: (def = {}) => (ready ? data.meta : def)
    },
    stateData
  );
}

/**
 * Gets the given path from the state or return the default:
 * {
 *   fetched: false,
 *   fetching: false,
 *   data: {},
 *   error: null
 * }
 *
 * @see lodash.get
 *
 * @param {object} state The redux state
 * @param {array | string} path The path to get. Passed to lodash.get
 *
 * @returns {object} State or default
 */
export function getFromState (state, path) {
  return get(state, path, {
    fetched: false,
    fetching: false,
    data: {},
    error: null
  });
}
