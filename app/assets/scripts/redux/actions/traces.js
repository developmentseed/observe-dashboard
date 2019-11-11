import { fetchAuth } from '../utils';
import { apiUrl } from '../../config';

/*
 * List of traces
 */

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

/*
 * Individual trace
 */

export const REQUEST_TRACE = 'REQUEST_TRACE';
export const RECEIVE_TRACE = 'RECEIVE_TRACE';
export const INVALIDATE_TRACE = 'INVALIDATE_TRACE';

export function invalidateTrace (id) {
  return { type: INVALIDATE_TRACE, id };
}

export function requestTrace (id) {
  return { type: REQUEST_TRACE, id };
}

export function receiveTrace (id, data, error = null) {
  return {
    type: RECEIVE_TRACE,
    id,
    data,
    error,
    receivedAt: Date.now()
  };
}

export function fetchTrace (id) {
  return fetchAuth({
    statePath: ['individualTraces', id],
    url: `${apiUrl}/traces/${id}`,
    requestFn: requestTrace.bind(this, id),
    receiveFn: receiveTrace.bind(this, id)
  });
}
