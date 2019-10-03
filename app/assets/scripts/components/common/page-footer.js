import React from 'react';
import styled, { css } from 'styled-components';

import { visuallyHidden } from '../../styles/helpers';
import { multiply } from '../../styles/utils/math';

import PropTypes from 'prop-types';
import { themeVal } from '../../styles/utils/general';

const PageFoot = styled.footer`
  background-color: ${themeVal('color.mist')};
  font-size: 0.875rem;
  line-height: 1rem;

  /* Visually hidden */
  ${({ isHidden }) => isHidden &&
   css`
      ${visuallyHidden()}
    `}
`;

const PageFootInner = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  padding: ${multiply(themeVal('layout.space'), 1.5)} ${multiply(themeVal('layout.space'), 2)};

  * {
    opacity: 0.64;
  }
`;

const PageFooter = props => {
  return (
    <PageFoot isHidden={props.isHidden}>
      <PageFootInner>
        <p>{props.credits}</p>
      </PageFootInner>
    </PageFoot>
  );
};

PageFooter.propTypes = {
  credits: PropTypes.string,
  isHidden: PropTypes.bool
};

export default PageFooter;
