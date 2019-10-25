/* eslint-disable react/no-access-state-in-setstate */
import React from 'react';
import { connect } from 'react-redux';
import { environment, apiUrl, baseUrl } from '../../config';
import { Inpage, InpageBody } from '../common/Inpage';
import * as authActions from '../../redux/actions/auth';
import { PropTypes as T } from 'prop-types';
import { showGlobalLoading, hideGlobalLoading } from '../common/GlobalLoading';
import { wrapApiResult } from '../../redux/utils';
import App from '../common/app';
import styled from 'styled-components';
import qs from 'qs';
import { Redirect } from 'react-router-dom';

const Wrapper = styled.div`
  display: grid;
  min-height: 100%;
  grid-template-columns: 1fr 20rem;
`;

class Login extends React.Component {
  async componentDidMount () {
    // Expose function in window object. This will be called from the popup
    // in order to pass the access token at the final OAuth step.
    window.authenticate = async accessToken => {
      showGlobalLoading();
      await this.props.authenticate(accessToken);
      hideGlobalLoading();
    };
  }

  componentWillUnmount () {
    // Remove exposed authenticated function when page is unmounted
    delete window.authenticate;
  }

  async login () {
    // Setting for popup window, parsed into DOMString
    const w = 600;
    const h = 550;
    const settings = [
      ['width', w],
      ['height', h],
      ['left', screen.width / 2 - w / 2],
      ['top', screen.height / 2 - h / 2]
    ]
      .map(function (x) {
        return x.join('=');
      })
      .join(',');

    // Open API login route in popup window to start OAuth
    window.open(
      `${apiUrl}/login?redirect=${baseUrl}/login/redirect`,
      'oauth_window',
      settings
    );
  }

  renderRedirectToIndex () {
    return <Redirect to='/' />;
  }

  renderContent () {
    const { pathname, search } = this.props.location;

    // At /logout route, remove user credentials and redirect to home
    if (pathname === '/logout') {
      this.props.logout();
      return <Redirect to='/' />;
    }

    // If user is logged in redirect to index
    const { isReady, hasError, getData } = this.props.authenticatedUser;
    if (isReady() && !hasError()) {
      const user = getData();
      if (user.osmId) {
        return <Redirect to='/' />;
      }
    }

    // Route "/login/redirect" is the final OAuth step. This will pass the
    // access token to the opener window and close popup.
    if (pathname === '/login/redirect') {
      const { accessToken } = qs.parse(search.substring(1));
      opener.authenticate(accessToken);
      window.close();
    }

    // Show button to start login process
    return (
      <div>
        <button
          type='submit'
          onClick={e => {
            e.preventDefault();
            this.login();
          }}
        >
          <span>Login via OpenStreetMap</span>
        </button>
      </div>
    );
  }

  render () {
    return (
      <App pageTitle='Login' hideFooter>
        <Inpage>
          <InpageBody>
            <Wrapper>{this.renderContent()}</Wrapper>
          </InpageBody>
        </Inpage>
      </App>
    );
  }
}

if (environment !== 'production') {
  Login.propTypes = {
    location: T.object,
    authenticatedUser: T.object,
    authenticate: T.func,
    logout: T.func
  };
}

function mapStateToProps (state) {
  return {
    authenticatedUser: wrapApiResult(state.authenticatedUser)
  };
}

function dispatcher (dispatch) {
  return {
    authenticate: (...args) => dispatch(authActions.authenticate(...args)),
    logout: (...args) => dispatch(authActions.logout(...args))
  };
}

export default connect(
  mapStateToProps,
  dispatcher
)(Login);
