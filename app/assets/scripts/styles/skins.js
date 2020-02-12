import { css } from 'styled-components';
import { themeVal } from './utils/general';

export const stackSkin = () => css`
  background-color: ${themeVal('color.surface')};
  box-shadow: 0 4px 16px 2px ${themeVal('color.shadow')};
`;

export const cardSkin = () => css`
  border-radius: ${themeVal('shape.rounded')};
  background: ${themeVal('color.surface')};
  box-shadow: 0 0 32px 2px ${themeVal('color.mist')}, 0 16px 48px -16px ${themeVal('color.shadow')};
`;
