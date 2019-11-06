'use strict';

/**
 * Delays the execution in x milliseconds.
 *
 * @param {int} millis Milliseconds
 */
export function delay (millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}
