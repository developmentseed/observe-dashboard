'use strict';

/**
 * Delays the execution in x milliseconds.
 *
 * @param {int} millis Milliseconds
 */
export function delay (millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}

/**
 * Get coordinates of GeoJSON feature as text
 *
 * @param {object} feature GeoJSON feature
 */
export function featureToCoords (feature) {  
  return feature.coordinates.join(', ');
}
