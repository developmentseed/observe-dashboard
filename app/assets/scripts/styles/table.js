import styled from 'styled-components';
import { rgba } from 'polished';

import { themeVal, stylizeFunction } from './utils/general';
import { multiply } from './utils/math';
import collecticon from './collecticons';
import media from './utils/media-queries';

const _rgba = stylizeFunction(rgba);

let glbsp = themeVal('layout.space');

const DataTable = styled.table`
  border-collapse: collapse;
  border-spacing: 0;
  width: 100%;
  max-width: 100%;
  margin-bottom: ${glbsp};

  th,
  td {
    padding: ${multiply(glbsp, 0.75)} ${glbsp};
    vertical-align: top;
  }

  thead th {
    font-size: 0.875rem;
    font-weight: ${themeVal('type.base.regular')};
    color: ${_rgba(themeVal('color.base'), 0.6)};
    letter-spacing: 0.25px;
    text-transform: uppercase;
    vertical-align: middle;
    position: relative;
    text-align: left;
  }

  th:first-child,
  td:first-child {
    padding-left: ${glbsp};
  }

  th:last-child,
  td:last-child {
    padding-right: ${glbsp};
    ${media.largeUp`
      padding-right: ${multiply(glbsp, 2)};
    `}
  }

  tr td:first-child {
    font-weight: ${themeVal('type.base.regular')};
    text-transform: uppercase;
  }

  tbody {
    tr:hover {
      background: ${_rgba(themeVal('color.primary'), 0.25)};
    }

    tr:active {
      background: ${_rgba(themeVal('color.smoke'), 0.25)};
    }

    a {
      color: ${_rgba(themeVal('color.primary'), 0.75)};
    
    }
  }
`;

export default DataTable;

// Additional table elements.

export const SortableLink = styled.a.attrs(({ sort }) => ({
  sort: sort || 'none'
}))`
  line-height: 1.5rem;
  vertical-align: bottom;
  color: ${_rgba(themeVal('colors.baseColor'), 0.6)};
  transition: color 0.24s ease 0s;

  &:hover {
    color: ${_rgba(themeVal('colors.baseColor'), 0.8)};
    opacity: 1;
  }

  &::after {
    ${({ sort }) => collecticon(`sort-${sort}`)}
    line-height: 1.5rem;
    vertical-align: middle;
    margin-left: 0.125rem;
    margin-top: -0.1rem;
    font-size: 1rem;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }
`;
