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
 * Get coordinates of GeoJSON feature as text
 *
 * @param {object} feature GeoJSON feature
 */
export function featureToCoords (feature) {
  return feature.coordinates.join(', ');
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
  return new Date(date).toLocaleDateString('en-GB', {
    dateStyle: 'long',
    timeStyle: 'short'
  });
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
