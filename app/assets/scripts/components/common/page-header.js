import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { rgba } from 'polished';

import config from '../../config';
import { Link, withRouter, NavLink } from 'react-router-dom';
import { themeVal, stylizeFunction } from '../../styles/utils/general';
import { multiply } from '../../styles/utils/math';
import { stackSkin } from '../../styles/skins';
import collecticon from '../../styles/collecticons';

const _rgba = stylizeFunction(rgba);

// eslint-disable-next-line react/display-name
const componentFilterProps = (Comp, toFilter = []) => React.forwardRef(
  (rawProps, ref) => {
    const props = Object.keys(rawProps).reduce((acc, p) => (
      toFilter.includes(p) ? acc : { ...acc, [p]: rawProps[p] }
    ), {});
    return <Comp ref={ref} {...props} />;
  }
);

const PageHead = styled.header`
  ${stackSkin()}
  position: relative;
  z-index: 10;
  display: flex;
`;

const PageHeadInner = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
  min-width: 100%;
`;

const PageTitle = styled.h1`
  font-size: 1.25rem;
  font-family: ${themeVal('type.heading.family')};
  line-height: 2rem;
  text-transform: uppercase;
  color: white;
  background-color: ${themeVal('color.primary')};
  padding: 1rem 2rem;
  margin: -1rem 0;
  letter-spacing: 0.1rem;
  a {
    color: inherit;
    display: block;
  }
`;

const PageNav = styled.nav`
  display: flex;
  margin: 0 ${multiply(themeVal('layout.space'), 2)} 0 auto;
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
`;

const GlobalMenuLink = styled.a.attrs({
  'data-place': 'right'
})`
  position: relative;
  display: flex;
  padding: 0.5rem 0.75rem;
  border-radius: 0.25rem;
  text-align: center;
  transition: all 0.24s ease 0s;
  font-weight: ${themeVal('type.base.regular')};
  &::before {
    ${({ useIcon }) => collecticon(useIcon)}
    margin-right: 0.5rem;
    position: relative;
    top: -1px;
  }
  &,
  &:visited {
    color: inherit;
  }
  &:hover {
    color: ${themeVal('color.link')};
    opacity: 1;
    background: ${_rgba(themeVal('color.link'), 0.08)};
  }
  &.active {
    color: ${themeVal('color.link')};
    font-weight: ${themeVal('type.base.medium')};
    background: ${_rgba(themeVal('color.link'), 0.08)};
    &::after {
      opacity: 1;
    }
  }
`;
// Special components to prevent styled-components error when properties are
// passed to the DOM element.
// https://github.com/styled-components/styled-components/issues/2131
const propsToFilter = ['variation', 'size', 'hideText', 'useIcon', 'active'];
const NavLinkFilter = componentFilterProps(NavLink, propsToFilter);
const AFilter = componentFilterProps('a', propsToFilter);

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
              <GlobalMenuLink
                as={NavLinkFilter}
                exact
                to='/traces'
                useIcon='chart-line'
                data-tip='View traces page'
                title='View traces page'
              >
                <span>Traces</span>
              </GlobalMenuLink>
            </li>
            <li>
              <GlobalMenuLink
                as={NavLinkFilter}
                exact
                to='/photos'
                useIcon='camera'
                data-tip='View photos page'
                title='View photos page'
              >
                <span>Photos</span>
              </GlobalMenuLink>
            </li>
            <li>
              <GlobalMenuLink
                as={NavLinkFilter}
                exact
                to='/about'
                useIcon='circle-information'
                data-tip='View about page'
                title='View about page'
              >
                <span>About</span>
              </GlobalMenuLink>
            </li>
            {config.environment !== 'production' && (
              <li>
                <GlobalMenuLink
                  as={NavLinkFilter}
                  exact
                  to='/sandbox'
                  useIcon='brand-development-seed-2'
                  data-tip='View sandbox page'
                  title='View sandbox page'
                >
                  <span>Sandbox</span>
                </GlobalMenuLink>
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
