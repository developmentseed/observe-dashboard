/* eslint-disable react/no-access-state-in-setstate */
import React from 'react';
import { PropTypes as T } from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import * as authActions from '../../redux/actions/auth';
import { wrapApiResult } from '../../redux/utils';
import { showGlobalLoading, hideGlobalLoading } from '../common/global-loading';

import { environment, apiUrl, baseUrl } from '../../config';
import App from '../common/app';
import { Inpage } from '../common/inpage';
import Button from '../../styles/button/button';

const InpageBody = styled.div`
  background: transparent;
  display: grid;
  min-height: 100%;
  padding: 4rem;
  grid-template-columns: 1fr 20rem;
`;

const IntroSection = styled.div``;

const Title = styled.div``;

const Lead = styled.div``;

const Buttons = styled.div``;

class Home extends React.Component {
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

  render () {
    // Redirect to Traces page when authenticated
    if (this.props.isAuthenticated) {
      return <Redirect to='/traces' />;
    }

    return (
      <App pageTitle='Home' hideFooter>
        <Inpage>
          <InpageBody>
            <IntroSection>
              <Title>
                <h1>Observe</h1>
              </Title>
              <Lead>
                <p>Cross-platform, offline, field mapping for OpenStreetMap</p>
              </Lead>
              <Buttons>
                <Button
                  useIcon='login'
                  variation='primary-raised-dark'
                  onClick={() => this.login()}
                >
                  Login
                </Button>
              </Buttons>
            </IntroSection>
          </InpageBody>
        </Inpage>
      </App>
    );
  }
}

if (environment !== 'production') {
  Home.propTypes = {
    isAuthenticated: T.bool,
    authenticate: T.func
  };
}

function mapStateToProps (state, props) {
  const { isReady, hasError } = wrapApiResult(state.authenticatedUser);
  const isAuthenticated = isReady() && !hasError();

  return {
    isAuthenticated
  };
}

function dispatcher (dispatch) {
  return {
    authenticate: (...args) => dispatch(authActions.authenticate(...args))
  };
}

export default connect(mapStateToProps, dispatcher)(Home);
