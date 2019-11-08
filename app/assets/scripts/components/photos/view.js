import React from 'react';
import { connect } from 'react-redux';
import { PropTypes as T } from 'prop-types';
import { Link } from 'react-router-dom';
import { environment } from '../../config';
import * as actions from '../../redux/actions/photos';
import { showGlobalLoading, hideGlobalLoading } from '../common/global-loading';
import { featureToCoords, formatDateTimeExtended } from '../../utils';
import styled from 'styled-components';

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
import Button from '../../styles/button/button';
import Prose from '../../styles/type/prose';
import { wrapApiResult, getFromState } from '../../redux/utils';

const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;  
`;

const Infobox = styled.div`
`;

const ActionButtonsWrapper = styled.div`
`;

class Photos extends React.Component {
  async componentDidMount () {
    showGlobalLoading();

    // Fetch photo from the API
    const { photoId } = this.props.match.params;
    await this.props.fetchPhoto(photoId);

    hideGlobalLoading();
  }

  renderContent () {
    const { isReady, hasError } = this.props.photo;

    if (!isReady()) return null;
    if (hasError()) return <UhOh />;

    const { getData } = this.props.photo;
    const photo = getData();

    return (
      <>
        <Button useIcon='chevron-left--small' variation='base-plain'>
          <Link to='/photos'>Back to photos</Link>
        </Button>
        <ContentWrapper>
          {this.renderPhoto(photo)}
          {this.renderInfobox(photo)}
        </ContentWrapper>
        <ActionButtonsWrapper>
          {this.renderActionButtons(photo)}
        </ActionButtonsWrapper>
      </>
    );
  }

  renderPhoto (photo) {
    return (
      <img
        alt={`Photo {photo.id}`}
        src='https://via.placeholder.com/800x600'
      />
    );
  }

  renderInfobox (photo) {
    return (
      <Infobox>
        <h2>id</h2>
        <p>{photo.id}</p>
        <h2>Description</h2>
        <p>{photo.description || 'No description available.'}</p>
        <h2>Owner</h2>
        <p>{photo.ownerId}</p>
        <h2>Location</h2>
        <p>{featureToCoords(photo.location)}</p>
        <h2>Bearing</h2>
        <p>{photo.bearing}</p>
        <h2>Created at</h2>
        <p>{formatDateTimeExtended(photo.createdAt)}</p>
        <h2>Uploaded at</h2>
        <p>{formatDateTimeExtended(photo.uploadedAt)}</p>
      </Infobox>
    );
  }

  renderActionButtons () {
    return (
      <ActionButtonsWrapper>
        <Button useIcon='trash-bin' variation='danger-raised-light'>
          Delete
        </Button>
        <Button useIcon='pencil' variation='primary-raised-dark'>
          Edit Metadata
        </Button>
        <Button useIcon='download' variation='primary-raised-dark'>
          Download
        </Button>
      </ActionButtonsWrapper>
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
