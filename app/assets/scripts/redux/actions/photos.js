import { fetchAuth } from '../utils';
import { apiUrl } from '../../config';

export const REQUEST_PHOTOS = 'REQUEST_PHOTOS';
export const RECEIVE_PHOTOS = 'RECEIVE_PHOTOS';
export const INVALIDATE_PHOTOS = 'INVALIDATE_PHOTOS';

export function invalidatePhotos () {
  return { type: INVALIDATE_PHOTOS };
}

export function requestPhotos () {
  return { type: REQUEST_PHOTOS };
}

export function receivePhotos (data, error = null) {
  return {
    type: RECEIVE_PHOTOS,
    data,
    error,
    receivedAt: Date.now()
  };
}

export function fetchPhotos () {
  return fetchAuth({
    statePath: 'photos',
    url: `${apiUrl}/photos`,
    requestFn: requestPhotos,
    receiveFn: receivePhotos
  });
}
