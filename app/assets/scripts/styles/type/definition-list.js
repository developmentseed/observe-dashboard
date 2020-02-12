'use strict';
import styled, { css } from 'styled-components';
import { rgba, clearFix } from 'polished';

import { themeVal, stylizeFunction } from '../utils/general';
import { divide } from '../utils/math';

const _rgba = stylizeFunction(rgba);

const Dl = styled.dl`
  dt {
    font-feature-settings: "pnum" 0; /* Use proportional numbers */
    font-family: ${themeVal('type.heading.family')};
    font-weight: ${themeVal('type.heading.regular')};
    text-transform: uppercase;
    color: ${_rgba(themeVal('type.base.color'), 0.64)};
    font-size: 0.875rem;
    line-height: 1.25rem;
  }

  dd, dt {
    margin: 0 0 ${divide(themeVal('layout.space'), 2)} 0;
  }

  dt:last-of-type,
  dd:last-child {
    margin-bottom: 0;
  }

  ${/* sc-declaration */({ type }) => type === 'horizontal' && css`
    ${clearFix()}

    dt, dd {
      float: left;
    }

    dd {
      width: 64%;
      padding-left: ${divide(themeVal('layout.space'), 2)};
    }

    dd + dd {
      margin-left: 36%;
    }

    dt {
      width: 36%;
      clear: left;
      padding-top: ${divide(themeVal('layout.space'), 8)};
      padding-bottom: ${divide(themeVal('layout.space'), 8)};
      padding-right: ${divide(themeVal('layout.space'), 2)};
    }
  `}
`;

export default Dl;
