import styled, { css } from 'styled-components';
import { rgba } from 'polished';

import { visuallyHidden } from '../../styles/helpers';
import { themeVal, stylizeFunction } from '../../styles/utils/general';
import { multiply } from '../../styles/utils/math';
import { stackSkin } from '../../styles/skins';
import { headingAlt } from '../../styles/type/heading';
import Constrainer from '../../styles/constrainer';

const _rgba = stylizeFunction(rgba);

export const Inpage = styled.article`
  display: grid;
  height: 100%;
  grid-template-rows: auto 1fr;
`;

export const InpageHeader = styled.header`
  ${stackSkin()}
  clip-path: polygon(0 0, 100% 0, 100% 200%, 0% 200%);
  position: relative;
  z-index: 10;

  /* Visually hidden */
  ${({ isHidden }) => isHidden &&
   css`
      ${visuallyHidden()}
    `}
`;

export const InpageHeaderInner = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-end;
  padding: ${themeVal('layout.space')} ${multiply(themeVal('layout.space'), 2)};
  margin: 0 auto;
`;

export const InpageHeadline = styled.div`
  display: flex;
  flex-flow: column;
  min-width: 0;
`;

export const InpageTitle = styled.h1`
  line-height: 2rem;
  font-size: 2.5rem;
`;

export const InpageTagline = styled.p`
  ${headingAlt()}
  order: -1;
  font-size: 0.875rem;
  line-height: 1rem;
  color: ${_rgba('#FFFFFF', 0.64)};
`;

export const InpageBody = styled.div`
  background: transparent;
`;

export const InpageBodyInner = styled(Constrainer)`
  padding-top: ${multiply(themeVal('layout.space'), 4)};
  padding-bottom: ${multiply(themeVal('layout.space'), 4)};
`;
