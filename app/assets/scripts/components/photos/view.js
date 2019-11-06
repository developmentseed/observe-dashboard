import React from 'react';
import { connect } from 'react-redux';
import { PropTypes as T } from 'prop-types';
import { Link } from 'react-router-dom';
import { environment } from '../../config';
import * as actions from '../../redux/actions/photos';
import { showGlobalLoading, hideGlobalLoading } from '../common/global-loading';
import { featureToCoords } from '../../utils';

import App from '../common/app';
import {
  Inpage,
  InpageHeader,
  InpageHeaderInner,
  InpageHeadline,
  InpageTitle,
  InpageBody,
  InpageBodyInner
} from '../common/inpage';
import UhOh from '../uhoh';
import Prose from '../../styles/type/prose';
import { wrapApiResult, getFromState } from '../../redux/utils';

class Photos extends React.Component {
  async componentDidMount () {
    showGlobalLoading();
    const { photoId } = this.props.match.params;
    await this.props.fetchPhoto(photoId);
    hideGlobalLoading();
  }

  renderContent () {
    const { isReady, hasError } = this.props.photo;

    if (!isReady()) return null;
    if (hasError()) return <UhOh />;

    return (
      <>
        <Link to='/photos'>Back to photos</Link>
        {this.renderMap()}
        {this.renderInfobox()}
      </>
    );
  }

  renderMap () {
    return <h2>Map (placeholder)</h2>;
  }

  renderInfobox () {
    const { getData } = this.props.photo;
    const photo = getData();
    return (
      <>
        <h2>id</h2>
        <p>{photo.id}</p>
        <h2>Description</h2>
        <p>{photo.description}</p>
        <h2>Owner</h2>
        <p>{photo.ownerId}</p>
        <h2>Location</h2>
        <p>{featureToCoords(photo.location)}</p>
        <h2>Bearing</h2>
        <p>{photo.bearing}</p>
        <h2>Created at</h2>
        <p>{new Date(photo.createdAt).toLocaleDateString()}</p>
        <h2>Uploaded at</h2>
        <p>{new Date(photo.uploadedAt).toLocaleDateString()}</p>
      </>
    );
  }

  render () {
    return (
      <App pageTitle='Photos'>
        <Inpage>
          <InpageHeader>
            <InpageHeaderInner>
              <InpageHeadline>
                <InpageTitle>Photo</InpageTitle>
              </InpageHeadline>
            </InpageHeaderInner>
          </InpageHeader>
          <InpageBody>
            <InpageBodyInner>
              <Prose>{this.renderContent()}</Prose>
            </InpageBodyInner>
          </InpageBody>
        </Inpage>
      </App>
    );
  }
}

if (environment !== 'production') {
  Photos.propTypes = {
    match: T.object,
    fetchPhoto: T.func,
    photo: T.object
  };
}

function mapStateToProps (state, props) {
  return {
    photo: wrapApiResult(
      getFromState(state.individualPhotos, props.match.params.photoId)
    )
  };
}

function dispatcher (dispatch) {
  return {
    fetchPhoto: (...args) => dispatch(actions.fetchPhoto(...args))
  };
}

export default connect(
  mapStateToProps,
  dispatcher
)(Photos);
