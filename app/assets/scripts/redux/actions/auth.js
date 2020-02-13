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

export function refreshProfile () {
  return async (dispatch, getState) => {
    const state = getState();
    const accessToken = get(state, 'authenticatedUser.data.accessToken');
    dispatch(authenticate(accessToken));
  };
}

export function logout () {
  return { type: INVALIDATE_AUTHENTICATED_USER };
}
