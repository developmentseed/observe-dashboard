import { fetchDispatchFactory } from '../utils';
import { apiUrl } from '../../config';
import get from 'lodash.get';

export const REQUEST_AUTHENTICATED_USER = 'REQUEST_AUTHENTICATED_USER';
export const RECEIVE_AUTHENTICATED_USER = 'RECEIVE_AUTHENTICATED_USER';
export const INVALIDATE_AUTHENTICATED_USER = 'INVALIDATE_AUTHENTICATED_USER';

export function invalidateAuthenticatedProfile () {
  return { type: INVALIDATE_AUTHENTICATED_USER };
}

export function requestAuthenticatedProfile () {
  return { type: REQUEST_AUTHENTICATED_USER };
}

export function receiveAuthenticatedProfile (data, error = null) {
  return {
    type: RECEIVE_AUTHENTICATED_USER,
    data,
    error,
    receivedAt: Date.now()
  };
}

export function authenticate (accessToken) {
  return fetchDispatchFactory({
    statePath: ['authenticatedUser'],
    url: `${apiUrl}/profile`,
    options: {
      headers: {
        Authorization: accessToken
      }
    },
    receiveFn: receiveAuthenticatedProfile,
    requestFn: requestAuthenticatedProfile,
    mutator: data => ({
      ...data,
      accessToken // include accessToken after successful request
    })
  });
}

/**
 * Performs an API request to fetch updated user profile data. As this
 * function is intended to be used in a background task to keep admin
 * status updated, it doesn't remove user data before performing the
 * request or when an error occur to avoid interface "flashing". The
 * implementation is basically the same of authenticate(), but the
 * accessToken comes from the state and request/error actions do not
 * change state.
 */
export function refreshProfile () {
  return async (dispatch, getState) => {
    const state = getState();
    const accessToken = get(state, 'authenticatedUser.data.accessToken');

    fetchDispatchFactory({
      statePath: ['authenticatedUser'],
      url: `${apiUrl}/profile`,
      options: {
        headers: {
          Authorization: accessToken
        }
      },
      receiveFn: (data, error = null) => {
        if (error) {
          // On error, don't change state
          return {
            type: 'SILENT_ERROR_AUTHENTICATED_USER'
          };
        } else {
          // On success, update the profile
          return receiveAuthenticatedProfile(data);
        }
      },
      requestFn: () => {
        // Do not change state when starting a request
        return {
          type: 'SILENT_REQUEST_AUTHENTICATED_USER'
        };
      },
      mutator: data => ({
        ...data,
        accessToken // include accessToken after successful request
      })
    })(dispatch, getState);
  };
}

export function logout () {
  return { type: INVALIDATE_AUTHENTICATED_USER };
}
