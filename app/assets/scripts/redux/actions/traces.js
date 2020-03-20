import { fetchAuth, patchItem, deleteItem } from '../utils';
import { apiUrl } from '../../config';
import qs from 'qs';
import { convertMeter2Kilometer } from '../../components/traces/utils';
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
  if (data.results) {
    data.results.forEach(element => {
      const lengthUnit = convertMeter2Kilometer(element.length);
      element['length'] = lengthUnit.length;
      element['unit'] = lengthUnit.unit;
    });
  }
  return {
    type: RECEIVE_TRACES,
    data,
    error,
    receivedAt: Date.now()
  };
}

export function fetchTraces (params) {
  const searchParams = qs.stringify(params);
  return fetchAuth({
    statePath: 'traces',
    url: `${apiUrl}/traces?${searchParams}`,
    requestFn: requestTraces,
    receiveFn: receiveTraces
  });
}

/*
 * Fetch individual trace
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
    data: {
      ...data,
      properties: {
        ...data.properties,
        ...convertMeter2Kilometer(data.properties.length)
      }
    },
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

/*
 * Update individual trace
 */

export const UPDATE_TRACE = 'UPDATE_TRACE';

export function updateTraceAction (id, data) {
  return { type: UPDATE_TRACE, id, data };
}

export function updateTrace (id, data) {
  return async (dispatch, getState) => {
    const state = getState();

    await patchItem(state, 'traces', id, data);

    dispatch(updateTraceAction(id, data));
  };
}

/*
 * Delete individual trace
 */

export function deleteTrace (id) {
  return async (dispatch, getState) => {
    const state = getState();

    await deleteItem(state, 'traces', id);

    dispatch(invalidateTrace(id));
  };
}
