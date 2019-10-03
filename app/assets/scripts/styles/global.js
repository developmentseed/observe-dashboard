import { createGlobalStyle, css } from 'styled-components';
import { normalize } from 'polished';

import { collecticonsFont } from './collecticons';

// Global styles for these components are included here for performance reasons.
// This way they're only rendered when absolutely needed.

const baseStyles = css`
  html {
    box-sizing: border-box;
  }
`;

export default createGlobalStyle`
  ${normalize()}
  ${collecticonsFont()}
  ${baseStyles}
`;
