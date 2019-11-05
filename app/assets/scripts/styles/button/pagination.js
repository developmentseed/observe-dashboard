import React from 'react';
import styled from 'styled-components';

import collecticon from '../collecticons';
import Button from './button';

const Pager = styled.ul`
  display: flex;
  justify-content: center;
  align-items: center;
  list-style: none;
  list-style-type: none !important;
  & :not(:first-child) {
    margin-left: 1rem;
  }
`;

const PrevButton = styled(Button).attrs({
  variation: 'base-raised-semidark' })`
  padding: 0.25rem;
  &::after {
    margin: 0;
    ${collecticon('chevron-left--small')};
`;

const NextButton = styled(Button).attrs({
  variation: 'base-raised-semidark' })`
  padding: 0.25rem;
  &::after {
    margin: 0;
    ${collecticon('chevron-right--small')};
`;

const Pagination = () => {
  return (
    <Pager>
      <li>
        <PrevButton />
      </li>
      <li>
        Displaying X of X Results
      </li>
      <li>
        <NextButton />
      </li>
    </Pager>
  );
};

export default Pagination;
