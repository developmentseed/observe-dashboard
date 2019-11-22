import React from 'react';
import { PropTypes as T } from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { environment, osmUrl } from '../../config';
import { featureToCoords, formatDateTimeExtended } from '../../utils';
import { wrapApiResult, getFromState, deleteItem } from '../../redux/utils';
import * as actions from '../../redux/actions/photos';

import App from '../common/app';
import { showGlobalLoading, hideGlobalLoading } from '../common/global-loading';
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
import Form from '../../styles/form/form';
import FormInput from '../../styles/form/input';
import FormLabel from '../../styles/form/label';
import {
  ContentWrapper,
  Infobox,
  ActionButtonsWrapper
} from '../common/view-wrappers';
import { LinkToOsmProfile } from '../common/link';
import toasts from '../common/toasts';
import { confirmDeleteItem } from '../common/confirmation-prompt';

const EditButtons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-left: 45%;
`;

const PhotoBox = styled.div`
  img {
    max-width: 100%;
  }
`;

class Photos extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      isEditing: false,
      newDescription: ''
    };

    this.updatePhoto = this.updatePhoto.bind(this);
    this.deletePhoto = this.deletePhoto.bind(this);
    this.renderActionButtons = this.renderActionButtons.bind(this);
  }

  async componentDidMount () {
    showGlobalLoading();

    // Fetch photo from the API
    const { photoId } = this.props.match.params;
    await this.props.fetchPhoto(photoId);

    hideGlobalLoading();
  }

  async updatePhoto (e) {
    e.preventDefault();

    const photo = this.props.photo.getData();
    const { newDescription } = this.state;

    // Avoid request if description didn't change
    if (photo.description === newDescription) {
      this.setState({ isEditing: false });
      return;
    }

    // Do not allow empty descriptions
    if (!newDescription || newDescription.length === 0) {
      toasts.error('Please enter a description.');
      return;
    }

    showGlobalLoading();

    try {
      // Make update request
      await this.props.updatePhoto(photo.id, { description: newDescription });

      // Show success toast.
      toasts.info('Photo was successfully updated.');

      // Disable editing state
      this.setState({ isEditing: false });
    } catch (error) {
      // Show error toast.
      toasts.error('An error occurred, photo was not updated.');
    }

    hideGlobalLoading();
  }

  async deletePhoto (e) {
    e.preventDefault();

    // Confirm delete
    const { photoId } = this.props.match.params;
    const { result } = await confirmDeleteItem('photo', photoId);

    // When delete is confirmed
    if (result) {
      showGlobalLoading();

      try {
        // Make delete request
        await this.props.deletePhoto();

        // Redirect to index if successful
        this.props.history.push(`/photos`);

        // Show success toast.
        toasts.info('Photo was successfully deleted.');
      } catch (error) {
        // Show error toast.
        toasts.error('An error occurred, photo was not deleted.');
      }

      hideGlobalLoading();
    }
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
          <InpageTitle>Photo {photo.id}</InpageTitle>
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
      ownerDisplayName,
      location,
      bearing,
      osmObjects,
      createdAt,
      uploadedAt
    } = photo;

    const { isEditing, newDescription } = this.state;

    return (
      <Infobox>
        <Form onSubmit={this.updatePhoto}>
          <FormLabel>Photo ID</FormLabel>
          <p>{id}</p>
          <FormLabel>Description</FormLabel>
          {isEditing ? (
            <FormInput
              ref={this.descriptionInput}
              type='text'
              size='large'
              id='input-text-a'
              placeholder='Enter a description'
              value={newDescription}
              autoComplete='off'
              onKeyDown={e => {
                if (e.key === 'Escape') {
                  this.setState({
                    isEditing: false
                  });
                }
              }}
              onChange={e => this.setState({ newDescription: e.target.value })}
              autoFocus
            />
          ) : (
            <p>{description || 'No description available.'}</p>
          )}

          <FormLabel>Owner</FormLabel>
          <p>
            <LinkToOsmProfile osmDisplayName={ownerDisplayName} />
          </p>
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
                    href={`${osmUrl}/${o}`}
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
          {isEditing && (
            <EditButtons>
              <Button
                variation='danger-raised-light'
                title='Cancel this action'
                size='large'
                useIcon='circle-xmark'
                onClick={() => this.setState({ isEditing: false })}
              >
                Cancel
              </Button>
              <Button
                variation='primary-raised-dark'
                title='Confirm this action'
                size='large'
                useIcon='circle-tick'
                onClick={this.updatePhoto}
              >
                Confirm
              </Button>
            </EditButtons>
          )}
        </Form>
      </Infobox>
    );
  }

  renderActionButtons (photo) {
    const { ownerId, description } = photo;
    const { osmId: userId, isAdmin } = this.props.authenticatedUser.getData();

    return (
      <ActionButtonsWrapper>
        {(isAdmin || userId === ownerId) && (
          <>
            <Button
              useIcon='trash-bin'
              variation='danger-raised-light'
              size='xlarge'
              onClick={this.deletePhoto}
            >
              Delete
            </Button>
            <Button
              useIcon='pencil'
              variation='primary-raised-semidark'
              size='xlarge'
              onClick={() =>
                this.setState({ isEditing: true, newDescription: description })}
            >
              Edit Description
            </Button>
          </>
        )}
        <Button
          useIcon='download'
          variation='primary-raised-dark'
          size='xlarge'
        >
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
    photo: T.object,
    history: T.object,
    updatePhoto: T.func,
    deletePhoto: T.func,
    authenticatedUser: T.object
  };
}

function mapStateToProps (state, props) {
  const { photoId } = props.match.params;
  const { individualPhotos, authenticatedUser } = state;

  return {
    photo: wrapApiResult(getFromState(individualPhotos, photoId)),
    authenticatedUser: wrapApiResult(authenticatedUser),
    deletePhoto: () => deleteItem(state, 'photos', photoId)
  };
}

function dispatcher (dispatch) {
  return {
    fetchPhoto: (...args) => dispatch(actions.fetchPhoto(...args)),
    updatePhoto: (...args) => dispatch(actions.updatePhoto(...args))
  };
}

export default connect(mapStateToProps, dispatcher)(Photos);
