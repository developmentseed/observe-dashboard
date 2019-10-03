import { css } from 'styled-components';
import { themeVal } from './utils/general';

export const stackSkin = () => css`
  background-color: ${themeVal('color.surface')};
  box-shadow: 0 4px 16px 2px ${themeVal('color.shadow')};
`;
