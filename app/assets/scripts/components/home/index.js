/* eslint-disable react/no-access-state-in-setstate */
import React from 'react';
import { PropTypes as T } from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { rgba } from 'polished';

import * as authActions from '../../redux/actions/auth';
import { wrapApiResult } from '../../redux/utils';
import { showGlobalLoading, hideGlobalLoading } from '../common/global-loading';

import { environment, apiUrl, baseUrl } from '../../config';
import { themeVal, stylizeFunction } from '../../styles/utils/general';
import media from '../../styles/utils/media-queries';
import App from '../common/app';
import { Inpage } from '../common/inpage';
import Button from '../../styles/button/button';

const _rgba = stylizeFunction(rgba);

const Homepage = styled(Inpage)`
  background: linear-gradient(128deg, ${_rgba(themeVal('color.primary'), 0.8)}, ${_rgba(0, 0, 0, 0.4)} 68%),
              url('../assets/graphics/content/bg-greatlakes.jpg');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
`;

const InpageBody = styled.div`
  background-image: url('../assets/graphics/content/bg-devices.svg');
  background-repeat: no-repeat;
  background-size: 120%;
  background-position: right -40vw bottom -20vw;
  background-attachment: fixed;
  display: grid;
  min-height: calc(100vh - 4rem);
  padding: 4rem;
  grid-template-columns: 1fr 0;
  justify-content: center;
  overflow: hidden;
  max-width: 100%;
  ${media.smallUp`
    background-size: contain;
  `}
  ${media.largeUp`
    padding-left: 12vw;
    background-position: right -20rem bottom -12rem;
  `}
`;

const IntroSection = styled.div`
  display: flex;
  flex-direction: column;
  text-shadow: 0px 1px 20px ${_rgba(0, 0, 0, 0.4)};
  ${media.largeUp`
    justify-content: center;
  `}
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  font-size: 2rem;
  color: white;
  letter-spacing: 0.25rem;
  text-transform: uppercase;
  h1 {
    margin: 0 1rem 0.5rem;
    font-weight: ${themeVal('type.base.black')};
  }
  img {
    width: 5rem;
  }
  ${media.largeUp`
    font-size: 3.5rem;
    img {
      width: 8rem;
    }
  `}
`;

const Lead = styled.div`
  font-size: 1.5rem;
  color: white;
  font-weight: ${themeVal('type.base.light')};
  margin: 1rem 0 2rem;
  ${media.largeUp`
    font-size: 1.75rem;
  `}
`;

const Buttons = styled.div`
  & * {
    font-size: 1.25rem;
  }
`;

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
        <Homepage>
          <InpageBody>
            <IntroSection>
              <Title>
                <img src='../assets/graphics/content/ObserveIcon.svg' />
                <h1>Observe</h1>
              </Title>
              <Lead>
                <p>Cross-platform, offline, field mapping for OpenStreetMap</p>
              </Lead>
              <Buttons>
                <Button
                  useIcon='login'
                  size='xlarge'
                  variation='primary-raised-dark'
                  onClick={() => this.login()}
                >
                  Login
                </Button>
              </Buttons>
            </IntroSection>
          </InpageBody>
        </Homepage>
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
