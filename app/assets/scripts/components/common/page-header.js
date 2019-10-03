import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import config from '../../config';
import { Link, withRouter, NavLink } from 'react-router-dom';
import { themeVal } from '../../styles/utils/general';
import { multiply } from '../../styles/utils/math';
import { stackSkin } from '../../styles/skins';

const PageHead = styled.header`
  ${stackSkin()}
  position: relative;
  z-index: 10;
`;

const PageHeadInner = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  padding: ${themeVal('layout.space')} ${multiply(themeVal('layout.space'), 2)};
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  font-size: 1.25rem;
  line-height: 1.25rem;
  margin: 0;

  a {
    color: inherit;
    display: block;
  }
`;

const PageNav = styled.nav`
  display: flex;
  margin: 0 0 0 auto;
`;

const GlobalMenu = styled.ul`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  margin: 0;
  list-style: none;

  > * {
    margin: 0 0 0 ${multiply(themeVal('layout.space'), 2)};
  }

  a {
    display: block;
    position: relative;
    font-size: 0.875rem;
    line-height: 2rem;
    color: inherit;
    text-transform: uppercase;
    font-weight: ${themeVal('type.base.regular')};
  }

  .active::before {
    position: absolute;
    top: 100%;
    left: 50%;
    width: 1rem;
    height: 1px;
    background: ${themeVal('type.base.color')};
    content: '';
    transform: translate(-50%, 0);
  }
`;

const PageHeader = props => {
  return (
    <PageHead>
      <PageHeadInner>
        <PageTitle>
          <Link to='/' title='Go to Dashboard'>
            {props.pageTitle}
          </Link>
        </PageTitle>
        <PageNav>
          <GlobalMenu>
            <li>
              <NavLink exact to='/traces' title='View page'>
                <span>Traces</span>
              </NavLink>
            </li>
            <li>
              <NavLink exact to='/photos' title='View page'>
                <span>Photos</span>
              </NavLink>
            </li>
            <li>
              <NavLink exact to='/about' title='View page'>
                <span>About</span>
              </NavLink>
            </li>
            {config.environment !== 'production' && (
              <li>
                <NavLink exact to='/sandbox' title='View page'>
                  <span>Sandbox</span>
                </NavLink>
              </li>
            )}
          </GlobalMenu>
        </PageNav>
      </PageHeadInner>
    </PageHead>
  );
};

PageHeader.propTypes = {
  pageTitle: PropTypes.string
};

export default withRouter(PageHeader);
