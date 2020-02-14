import React from 'react';
import { connect } from 'react-redux';
import { wrapApiResult } from '../../redux/utils';
import * as authActions from '../../redux/actions/auth';
import { PropTypes as T } from 'prop-types';
import { refreshProfileInterval } from '../../config';

class ProfileListener extends React.Component {
  constructor (props) {
    super(props);
    this.refreshUserProfile = this.refreshUserProfile.bind(this);
    setInterval(this.refreshUserProfile, refreshProfileInterval);
  }

  componentDidMount () {
    this.refreshUserProfile();
  }

  componentWillUnmount () {
    clearInterval(this.refreshUserProfile);
  }

  refreshUserProfile () {
    if (this.props.isAuthenticated) {
      this.props.refreshProfile();
    }
  }

  render () {
    return null;
  }
}

ProfileListener.propTypes = {
  isAuthenticated: T.bool,
  refreshProfile: T.func
};

function mapStateToProps (state) {
  const { isReady, hasError } = wrapApiResult(state.authenticatedUser);
  const isAuthenticated = isReady() && !hasError();

  return {
    isAuthenticated
  };
}

function dispatcher (dispatch) {
  return {
    refreshProfile: (...args) => dispatch(authActions.refreshProfile(...args))
  };
}

export default connect(mapStateToProps, dispatcher)(ProfileListener);
