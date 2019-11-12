import React from 'react';
import styled from 'styled-components';
import { PropTypes as T } from 'prop-types';
import { rgba } from 'polished';
import { connect } from 'react-redux';
import config from '../../config';
import { wrapApiResult } from '../../redux/utils';
import { Link, NavLink } from 'react-router-dom';
import { themeVal, stylizeFunction } from '../../styles/utils/general';
import { multiply } from '../../styles/utils/math';
import { stackSkin } from '../../styles/skins';
import collecticon from '../../styles/collecticons';
import ObserveIcon from '../../../graphics/content/ObserveIcon';
import { filterComponentProps } from '../../utils';
const _rgba = stylizeFunction(rgba);

const PageHead = styled.header`
  ${stackSkin()}
  position: relative;
  z-index: 10;
  display: flex;
  overflow: hidden;
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
  letter-spacing: 0.2rem;
  font-weight: ${themeVal('type.heading.black')};
  svg {
    margin-right: 0.5rem;
  }
  a {
    color: inherit;
    display: flex;
    padding: 0 2rem 0.5rem;
  }
  span {
    font-size: 0.575rem;
    font-weight: ${themeVal('type.heading.light')};
    position: absolute;
    bottom: 0.125rem;
    left: 6.5rem;
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
const NavLinkFilter = filterComponentProps(NavLink, propsToFilter);

class PageHeader extends React.Component {
  render () {
    let isLogged = false;
    const { isReady, hasError, getData } = this.props.authenticatedUser;
    if (isReady() && !hasError()) {
      const user = getData();
      if (user.osmId) {
        isLogged = true;
      }
    }

    return (
      <PageHead>
        <PageHeadInner>
          <PageTitle>
            <Link to='/' title='Go to Dashboard'>
              <ObserveIcon />
              {this.props.pageTitle}
              <span>API Dashboard</span>
            </Link>
          </PageTitle>
          <PageNav>
            <GlobalMenu>
              {config.environment !== 'production' && (
                <li>
                  <GlobalMenuLink
                    as={NavLinkFilter}
                    exact
                    useIcon='brand-development-seed-2'
                    to='/sandbox'
                    title='View sandbox page'
                  >
                    <span>Sandbox</span>
                  </GlobalMenuLink>
                </li>
              )}
              <li>
                <GlobalMenuLink
                  as={NavLinkFilter}
                  exact
                  useIcon='circle-information'
                  to='/about'
                  title='View about page'
                >
                  <span>About</span>
                </GlobalMenuLink>
              </li>
              {!isLogged ? (
                <li>
                  <GlobalMenuLink
                    as={NavLinkFilter}
                    exact
                    useIcon='login'
                    to='/login'
                    title='Proceed to login'
                  >
                    <span>Login</span>
                  </GlobalMenuLink>
                </li>
              ) : (
                <>
                  <li>
                    <GlobalMenuLink
                      as={NavLinkFilter}
                      exact
                      to='/traces'
                      useIcon='chart-line'
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
                      title='View photos page'
                    >
                      <span>Photos</span>
                    </GlobalMenuLink>
                  </li>
                  <li>
                    <GlobalMenuLink
                      as={NavLinkFilter}
                      exact
                      useIcon='logout'
                      to='/logout'
                      title='Proceed to logout'
                    >
                      <span>Logout</span>
                    </GlobalMenuLink>
                  </li>
                </>
              )}
            </GlobalMenu>
          </PageNav>
        </PageHeadInner>
      </PageHead>
    );
  }
}

PageHeader.propTypes = {
  pageTitle: T.string,
  authenticatedUser: T.object
};

function mapStateToProps (state) {
  return {
    authenticatedUser: wrapApiResult(state.authenticatedUser)
  };
}

function dispatcher (dispatch) {
  return {};
}

export default connect(
  mapStateToProps,
  dispatcher
)(PageHeader);
