import { fetchAuth } from '../utils';
import { apiUrl } from '../../config';

/*
 * List of users
 */

export const REQUEST_USERS = 'REQUEST_USERS';
export const RECEIVE_USERS = 'RECEIVE_USERS';
export const INVALIDATE_USERS = 'INVALIDATE_USERS';

export function invalidateUsers () {
  return { type: INVALIDATE_USERS };
}

export function requestUsers () {
  return { type: REQUEST_USERS };
}

export function receiveUsers (data, error = null) {
  return {
    type: RECEIVE_USERS,
    data,
    error,
    receivedAt: Date.now()
  };
}

export function fetchUsers (searchParams) {
  return fetchAuth({
    statePath: 'users',
    url: `${apiUrl}/users${searchParams || ''}`,
    requestFn: requestUsers,
    receiveFn: receiveUsers
  });
}
