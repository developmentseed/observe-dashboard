/* eslint-disable react/no-access-state-in-setstate */
import React from 'react';
// import { PropTypes } from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';

import App from '../common/app';
import { Inpage, InpageBody } from '../common/inpage';

const Wrapper = styled.div`
  display: grid;
  min-height: 100%;
  grid-template-columns: 1fr 20rem;
`;

class Home extends React.Component {
  render () {
    return (
      <App pageTitle='Home' hideFooter>
        <Inpage>
          <InpageBody>
            <Wrapper>
              <h1>Home page</h1>
            </Wrapper>
          </InpageBody>
        </Inpage>
      </App>
    );
  }
}

Home.propTypes = {};

function mapStateToProps (state, props) {
  return {};
}

function dispatcher (dispatch) {
  return {};
}

export default connect(
  mapStateToProps,
  dispatcher
)(Home);
