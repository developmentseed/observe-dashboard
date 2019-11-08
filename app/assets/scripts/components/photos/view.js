import React from 'react';
import { connect } from 'react-redux';
import { PropTypes as T } from 'prop-types';
import { environment } from '../../config';
import * as actions from '../../redux/actions/photos';
import { showGlobalLoading, hideGlobalLoading } from '../common/global-loading';
import { featureToCoords, formatDateTimeExtended } from '../../utils';

import styled from 'styled-components';
import Form from '../../styles/form/form';
import FormLabel from '../../styles/form/label';

import App from '../common/app';
import {
  Inpage,
  InpageHeadline,
  InpageTitle,
  InpageBody,
  InpageBackLink,
  InpageBodyInner
} from '../common/inpage';
import UhOh from '../uhoh';
import Button from '../../styles/button/button';
import Prose from '../../styles/type/prose';
import { wrapApiResult, getFromState } from '../../redux/utils';
import { ContentWrapper, Infobox, ActionButtonsWrapper } from '../common/view-wrappers';

const PhotoBox = styled.div`
  img {
    max-width: 100%;
  }
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
        <InpageHeadline>
          <InpageBackLink to='/photos'>Back to photos</InpageBackLink>
          <InpageTitle>
            Photo {photo.id}
          </InpageTitle>
        </InpageHeadline>
        <ContentWrapper>
          {this.renderPhoto(photo)}
          {this.renderInfobox(photo)}
        </ContentWrapper>
        {this.renderActionButtons(photo)}
      </>
    );
  }

  renderPhoto (photo) {
    return (
      <PhotoBox>
        <img
          alt={`Photo {photo.id}`}
          src='https://via.placeholder.com/800x600'
        />
      </PhotoBox>
    );
  }

  renderInfobox (photo) {
    const {
      id,
      description,
      ownerId,
      location,
      bearing,
      osmObjects,
      createdAt,
      uploadedAt
    } = photo;

    return (
      <Infobox>
        <Form>
          <FormLabel>Photo ID</FormLabel>
          <p>{id}</p>
          <FormLabel>Description</FormLabel>
          <p>{description || 'No description available.'}</p>
          <FormLabel>Owner</FormLabel>
          <p>{ownerId}</p>
          <FormLabel>Location</FormLabel>
          <p>{featureToCoords(location)}</p>
          <FormLabel>Bearing</FormLabel>
          <p>{bearing}</p>
          <FormLabel>OSM Objects</FormLabel>
          {osmObjects && osmObjects.length > 0 ? (
            <ul>
              {osmObjects.map((o, i) => (
                <li key={o}>
                  <a
                    href={`https://www.openstreetmap.org/${o}`}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {o}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>No assigned objects</p>
          )}
          <FormLabel>Created at</FormLabel>
          <p>{formatDateTimeExtended(createdAt)}</p>
          <FormLabel>Uploaded at</FormLabel>
          <p>{formatDateTimeExtended(uploadedAt)}</p>
        </Form>
      </Infobox>
    );
  }

  renderActionButtons () {
    return (
      <ActionButtonsWrapper>
        <Button useIcon='trash-bin' variation='danger-raised-light' size='xlarge'>
          Delete
        </Button>
        <Button useIcon='pencil' variation='primary-raised-semidark' size='xlarge'>
          Edit Metadata
        </Button>
        <Button useIcon='download' variation='primary-raised-dark' size='xlarge'>
          Download
        </Button>
      </ActionButtonsWrapper>
    );
  }

  render () {
    return (
      <App pageTitle='Photos'>
        <Inpage>
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
