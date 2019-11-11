import { fetchAuth } from '../utils';
import { apiUrl } from '../../config';

/*
 * List of photos
 */

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

/*
 * Individual photo
 */

export const REQUEST_PHOTO = 'REQUEST_PHOTO';
export const RECEIVE_PHOTO = 'RECEIVE_PHOTO';
export const INVALIDATE_PHOTO = 'INVALIDATE_PHOTO';

export function invalidatePhoto (id) {
  return { type: INVALIDATE_PHOTO, id };
}

export function requestPhoto (id) {
  return { type: REQUEST_PHOTO, id };
}

export function receivePhoto (id, data, error = null) {
  return {
    type: RECEIVE_PHOTO,
    id,
    data,
    error,
    receivedAt: Date.now()
  };
}

export function fetchPhoto (id) {
  return fetchAuth({
    statePath: ['individualPhotos', id],
    url: `${apiUrl}/photos/${id}`,
    requestFn: requestPhoto.bind(this, id),
    receiveFn: receivePhoto.bind(this, id)
  });
}
