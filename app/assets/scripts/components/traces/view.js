import React from 'react';
import styled from 'styled-components';
import mapboxgl from 'mapbox-gl';
import bbox from '@turf/bbox';
import get from 'lodash.get';
import { PropTypes as T } from 'prop-types';
import { mapboxAccessToken, environment } from '../../config';
import { formatDateTimeExtended, startCoordinate } from '../../utils';
import { connect } from 'react-redux';
import * as actions from '../../redux/actions/traces';
import { wrapApiResult, getFromState } from '../../redux/utils';
import { handleExportToJosm, downloadTrace } from './utils';

import App from '../common/app';
import {
  Inpage,
  InpageBody,
  InpageTitle,
  InpageHeadline,
  InpageBodyInner,
  InpageBackLink
} from '../common/inpage';
import UhOh from '../uhoh';
import Prose from '../../styles/type/prose';
import Button from '../../styles/button/button';
import Form from '../../styles/form/form';
import FormLabel from '../../styles/form/label';
import FormInput from '../../styles/form/input';
import {
  ContentWrapper,
  Infobox,
  ActionButtonsWrapper
} from '../common/view-wrappers';
import { LinkToOsmProfile } from '../common/link';
import toasts from '../common/toasts';
import { confirmDeleteItem } from '../common/confirmation-prompt';
import { showGlobalLoading, hideGlobalLoading } from '../common/global-loading';

// Mapbox access token
mapboxgl.accessToken = mapboxAccessToken;

const Map = styled.div``;

const EditButtons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-left: 45%;
`;

class Traces extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      mapLoaded: false,
      isEditing: false,
      newDescription: ''
    };

    this.deleteTrace = this.deleteTrace.bind(this);
    this.updateTrace = this.updateTrace.bind(this);
    this.renderActionButtons = this.renderActionButtons.bind(this);
  }

  async componentDidMount () {
    showGlobalLoading();

    // Fetch trace from the API
    const { traceId } = this.props.match.params;
    await this.props.fetchTrace(traceId);

    hideGlobalLoading();
  }

  componentDidUpdate () {
    const { mapLoaded } = this.state;

    // Bypass if map is already loaded
    if (mapLoaded) return;

    // Check if geometry is available
    const { isReady, hasError, getData } = this.props.trace;
    if (!isReady() || hasError()) return null;
    const { geometry } = getData();

    // Add Map component
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v9',
      interactive: false,
      attributionControl: false,
      bounds: bbox(geometry),
      fitBoundsOptions: { padding: 20 }
    }).addControl(
      new mapboxgl.AttributionControl({
        compact: false
      })
    );

    // Add trace when map is fully loaded
    const self = this;
    this.map.on('load', function () {
      self.map.addLayer({
        id: 'trace',
        type: 'line',
        source: {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: geometry
          }
        }
      });
      self.setState({ mapLoaded: true });
    });
  }

  async deleteTrace (e) {
    e.preventDefault();

    // Confirm delete
    const { traceId } = this.props.match.params;
    const { result } = await confirmDeleteItem('trace', traceId);

    // When delete is confirmed
    if (result) {
      showGlobalLoading();

      try {
        // Make delete request
        await this.props.deleteTrace(traceId);

        // Redirect to index if successful
        this.props.history.push(`/traces`);

        // Show success toast.
        toasts.info(`Trace ${traceId} was successfully deleted.`);
      } catch (error) {
        // Show error toast.
        toasts.error(`An error occurred, trace ${traceId} was not deleted.`);
      }

      hideGlobalLoading();
    }
  }

  async updateTrace (e) {
    e.preventDefault();

    const trace = this.props.trace.getData().properties;
    const { newDescription } = this.state;

    // Avoid request if description didn't change
    if (trace.description === newDescription) {
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
      await this.props.updateTrace(trace.id, { description: newDescription });

      // Show success toast.
      toasts.info('Trace was successfully updated.');

      // Disable editing state
      this.setState({ isEditing: false });
    } catch (error) {
      // Show error toast.
      toasts.error('An error occurred, trace was not updated.');
    }

    hideGlobalLoading();
  }

  renderContent () {
    const { isReady, hasError, getData } = this.props.trace;

    if (!isReady()) return null;
    if (hasError()) return <UhOh />;

    // Get trace data
    const { properties: trace, geometry } = getData();

    return (
      <>
        <InpageHeadline>
          <InpageBackLink to='/traces'>Back to traces</InpageBackLink>
          <InpageTitle>Trace {trace.id}</InpageTitle>
        </InpageHeadline>
        <ContentWrapper>
          {this.renderMap(geometry)}
          {this.renderInfobox(trace, geometry)}
        </ContentWrapper>
        {this.renderActionButtons(trace)}
      </>
    );
  }

  renderMap () {
    return (
      <Map>
        {mapboxgl.supported() ? (
          <div
            ref={r => {
              this.mapContainer = r;
            }}
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <div className='mapbox-no-webgl'>
            <p>WebGL is not supported or disabled.</p>
          </div>
        )}
      </Map>
    );
  }

  renderInfobox (trace, geometry) {
    const { isEditing, newDescription } = this.state;
    return (
      <Infobox>
        <Form onSubmit={this.updateTrace}>
          <FormLabel>id</FormLabel>
          <p>{trace.id}</p>
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
            <p>{trace.description}</p>
          )}

          <FormLabel>Length</FormLabel>
          <p>{trace.length} m</p>
          <FormLabel>Owner</FormLabel>
          <p>
            <LinkToOsmProfile osmDisplayName={trace.ownerDisplayName} />
          </p>
          <FormLabel>Start coordinate</FormLabel>
          <p>{startCoordinate(geometry)}</p>
          <FormLabel>Recorded at</FormLabel>
          <p>{formatDateTimeExtended(trace.recordedAt)}</p>
          <FormLabel>Uploaded at</FormLabel>
          <p>{formatDateTimeExtended(trace.uploadedAt)}</p>
          <FormLabel>Updated at</FormLabel>
          <p>{formatDateTimeExtended(trace.updatedAt)}</p>
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
                onClick={this.updateTrace}
              >
                Confirm
              </Button>
            </EditButtons>
          )}
        </Form>
      </Infobox>
    );
  }

  renderActionButtons (trace) {
    const { isEditing } = this.state;
    const { id: traceId, ownerId, description } = trace;

    const { osmId: userId, isAdmin } = this.props.authenticatedUser.getData();

    return (
      <ActionButtonsWrapper>
        {(isAdmin || userId === ownerId) && (
          <>
            <Button
              useIcon='trash-bin'
              variation='danger-raised-light'
              size='xlarge'
              onClick={this.deleteTrace}
              disabled={isEditing}
            >
              Delete
            </Button>
            <Button
              useIcon='pencil'
              variation='primary-raised-semidark'
              size='xlarge'
              onClick={() =>
                this.setState({ isEditing: true, newDescription: description })}
              disabled={isEditing}
            >
              Edit Description
            </Button>
          </>
        )}
        <Button
          useIcon='share'
          variation='base-raised-semidark'
          size='xlarge'
          onClick={e => handleExportToJosm(e, traceId)}
          disabled={isEditing}
        >
          Export to JOSM
        </Button>
        <Button
          useIcon='download'
          variation='primary-raised-dark'
          size='xlarge'
          onClick={e => {
            e.preventDefault();
            downloadTrace(this.props.accessToken, traceId);
          }}
          disabled={isEditing}
        >
          Download
        </Button>
      </ActionButtonsWrapper>
    );
  }

  render () {
    return (
      <App pageTitle='Traces'>
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
  Traces.propTypes = {
    accessToken: T.string,
    authenticatedUser: T.object,
    deleteTrace: T.func,
    fetchTrace: T.func,
    history: T.object,
    match: T.object,
    trace: T.object,
    updateTrace: T.func
  };
}

function mapStateToProps (state, props) {
  const { traceId } = props.match.params;
  const { individualTraces, authenticatedUser } = state;

  return {
    trace: wrapApiResult(getFromState(individualTraces, traceId)),
    authenticatedUser: wrapApiResult(authenticatedUser),
    accessToken: get(state, 'authenticatedUser.data.accessToken')
  };
}

function dispatcher (dispatch) {
  return {
    fetchTrace: (...args) => dispatch(actions.fetchTrace(...args)),
    updateTrace: (...args) => dispatch(actions.updateTrace(...args)),
    deleteTrace: (...args) => dispatch(actions.deleteTrace(...args))
  };
}

export default connect(mapStateToProps, dispatcher)(Traces);
