import React from 'react';

/**
 * Delays the execution in x milliseconds.
 *
 * @param {int} millis Milliseconds
 */
export function delay (millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}

/**
 * Round a float to 5 decimal places, if needed.
 *
 * Reference: https://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-only-if-necessary
 *
 * @param {float} coord Coordinate as float
 */
export function roundToFiveDecimals (coord) {
  return Math.round(coord * 100000 + Number.EPSILON) / 100000;
}

/**
 * Get coordinates of GeoJSON feature as text
 *
 * @param {object} feature GeoJSON feature
 */
export function featureToCoords (feature, round) {
  const coordinates = feature.coordinates;
  return (round ? coordinates.map(roundToFiveDecimals) : coordinates).join(', ');
}

/**
 * Get start coordinate of GeoJSON line feature as text.
 *
 * @param {object} feature GeoJSON feature
 */
export function startCoordinate (feature) {
  return feature.coordinates[0].join(', ');
}

/**
 * Format date as extended text.
 *
 * @param {string} date Date as ISO string
 */
export function formatDateTimeExtended (date) {
  return new Date(date).toString();
}

/**
 * Get UTC date string from ISO Date string.
 *
 * @param {string} date Date as ISO string
 */
export function getUTCDate (isoDateStr) {
  return utcDate(isoDateStr).toLocaleDateString();
}

/**
 * Create a date which matches the input date offsetting the timezone to match
 * the user's.
 * If the user is in UTC-5 time and the date string is in UTC the date will be
 * constructed disregarding the input date's timezone.
 * Ex:
 * input: 2019-01-01T00:00:00Z
 * normal output: 2018-12-31T19:00:00 -05:00
 * utcDate output: 2019-01-01T00:00:00 -05:00
 *
 * Basically the real date gets changed by the timezone offset.
 *
 * Times I had timezone related bugs: 3
 *
 * @param {string} str Date String
 *
 * @returns Date
 */
export function utcDate (str) {
  const date = new Date(str);
  // If the date is not valid, return it and be done.
  if (isNaN(date.getTime())) return date;
  const offset = date.getTimezoneOffset();
  date.setTime(date.getTime() + offset * 60 * 1000);
  return date;
}

/**
 * Removes given props from the component returning a new one.
 * This is used to circumvent a bug with styled-components where unwanted props
 * are passed to the DOM causing react to display an error:
 *
 * ```
 *   `Warning: React does not recognize the hideText prop on a DOM element.
 *   If you intentionally want it to appear in the DOM as a custom attribute,
 *   spell it as lowercase hideText instead. If you accidentally passed it from
 *   a parent component, remove it from the DOM element.`
 * ```
 *
 * This commonly happens when an element is impersonating another with the
 * `as` prop:
 *
 *     <Button hideText as={Link}>Home</Button>
 *
 * Because of a bug, all the props passed to `Button` are passed to `Link`
 * without being filtered before rendering, causing the aforementioned error.
 *
 * This utility creates a component that filter out unwanted props and can be
 * safely used as an impersonator.
 *
 *     const CleanLink = filterComponentProps(Link, ['hideText'])
 *     <Button hideText as={CleanLink}>Home</Button>
 *
 * Issue tracking the bug: https://github.com/styled-components/styled-components/issues/2131
 *
 * Note: The props to filter out are manually defined to reduce bundle size,
 * but it would be possible to automatically filter out all invalid props
 * using something like @emotion/is-prop-valid
 *
 * @param {object} Comp The react component
 * @param {array} filterProps Props to filter off of the component
 */
export function filterComponentProps (Comp, filterProps = []) {
  const isValidProp = p => !filterProps.includes(p);
  return React.forwardRef((rawProps, ref) => {
    const props = Object.keys(rawProps).reduce((acc, p) => (
      isValidProp(p) ? { ...acc, [p]: rawProps[p] } : acc
    ), {});
    return <Comp ref={ref} {...props} />;
  });
}
