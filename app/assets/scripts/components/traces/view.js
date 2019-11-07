import React from 'react';
import { connect } from 'react-redux';
import { PropTypes as T } from 'prop-types';
import { Link } from 'react-router-dom';
import { mapboxAccessToken, environment } from '../../config';
import * as actions from '../../redux/actions/traces';
import { showGlobalLoading, hideGlobalLoading } from '../common/global-loading';
import styled from 'styled-components';
import mapboxgl from 'mapbox-gl';
import bbox from '@turf/bbox';

import App from '../common/app';
import {
  Inpage,
  InpageBody,
  InpageBodyInner
} from '../common/inpage';
import UhOh from '../uhoh';
import Prose from '../../styles/type/prose';
import Button from '../../styles/button/button';
import { wrapApiResult, getFromState } from '../../redux/utils';
import { formatDateTimeExtended, startCoordinate } from '../../utils';

// Mapbox access token
mapboxgl.accessToken = mapboxAccessToken;

const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;  
`;

const Infobox = styled.div`
`;

const Map = styled.div`
`;

const ActionButtonsWrapper = styled.div`
`;

class Traces extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      mapLoaded: false
    };
  }

  async componentDidMount () {
    showGlobalLoading();

    // Fetch trace from the API
    const { traceId } = this.props.match.params;
    await this.props.fetchTrace(traceId);

    hideGlobalLoading();
  }

  componentDidUpdate (prevProps) {
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
    }).addControl(new mapboxgl.AttributionControl({
      compact: false
    }));

    // Add trace when map is fully loaded
    const self = this;
    this.map.on('load', function () {
      self.map.addLayer({
        'id': 'trace',
        'type': 'line',
        'source': {
          'type': 'geojson',
          'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': geometry
          }
        }
      });
      self.setState({ mapLoaded: true });
    });
  }

  renderContent () {
    const { isReady, hasError, getData } = this.props.trace;

    if (!isReady()) return null;
    if (hasError()) return <UhOh />;

    const { properties: trace } = getData();

    return (
      <>
        <Link to='/traces'>Back to traces</Link>
        <h1>Trace {trace.id}</h1>
        <ContentWrapper>
          {this.renderMap()}
          {this.renderInfobox()}
        </ContentWrapper>
        <ActionButtonsWrapper>
          {this.renderActionButtons()}
        </ActionButtonsWrapper>
      </>
    );
  }

  renderMap () {
    return (
      <Map>
        {mapboxgl.supported() ? (
          <div
            ref={(r) => { this.mapContainer = r; }}
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

  renderInfobox () {
    const { getData } = this.props.trace;
    const { properties: trace, geometry } = getData();
    return (
      <Infobox>
        <h2>id</h2>
        <p>{trace.id}</p>
        <h2>Description</h2>
        <p>{trace.description}</p>
        <h2>Length</h2>
        <p>{trace.length}</p>
        <h2>Owner</h2>
        <p>{trace.ownerId}</p>
        <h2>Start coordinate</h2>
        <p>{startCoordinate(geometry)}</p>
        <h2>Recorded at</h2>
        <p>{formatDateTimeExtended(trace.recordedAt)}</p>
        <h2>Uploaded at</h2>
        <p>{formatDateTimeExtended(trace.uploadedAt)}</p>
        <h2>Updated at</h2>
        <p>{formatDateTimeExtended(trace.updatedAt)}</p>
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
        <Button useIcon='export' variation='primary-raised-dark'>
          Export to JOSM
        </Button>
        <Button useIcon='download' variation='primary-raised-dark'>
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
    match: T.object,
    fetchTrace: T.func,
    trace: T.object
  };
}

function mapStateToProps (state, props) {
  return {
    trace: wrapApiResult(
      getFromState(state.individualTraces, props.match.params.traceId)
    )
  };
}

function dispatcher (dispatch) {
  return {
    fetchTrace: (...args) => dispatch(actions.fetchTrace(...args))
  };
}

export default connect(
  mapStateToProps,
  dispatcher
)(Traces);
