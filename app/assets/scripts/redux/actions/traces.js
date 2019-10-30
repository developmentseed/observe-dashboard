import { fetchAuth } from '../utils';
import { apiUrl } from '../../config';

export const REQUEST_TRACES = 'REQUEST_TRACES';
export const RECEIVE_TRACES = 'RECEIVE_TRACES';
export const INVALIDATE_TRACES = 'INVALIDATE_TRACES';

export function invalidateTraces () {
  return { type: INVALIDATE_TRACES };
}

export function requestTraces () {
  return { type: REQUEST_TRACES };
}

export function receiveTraces (data, error = null) {
  return {
    type: RECEIVE_TRACES,
    data,
    error,
    receivedAt: Date.now()
  };
}

export function fetchTraces () {
  return fetchAuth({
    statePath: 'traces',
    url: `${apiUrl}/traces`,
    requestFn: requestTraces,
    receiveFn: receiveTraces
  });
}
