import React from 'react';
import { connect } from 'react-redux';
import { PropTypes as T } from 'prop-types';
import { Link } from 'react-router-dom';
import { environment } from '../../config';
import * as actions from '../../redux/actions/traces';
import { showGlobalLoading, hideGlobalLoading } from '../common/global-loading';

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

class Traces extends React.Component {
  async componentDidMount () {
    showGlobalLoading();
    const { traceId } = this.props.match.params;
    await this.props.fetchTrace(traceId);
    hideGlobalLoading();
  }

  renderContent () {
    const { isReady, hasError } = this.props.trace;

    if (!isReady()) return null;
    if (hasError()) return <UhOh />;

    return (
      <>
        <Link to='/traces'>Back to traces</Link>
        {this.renderMap()}
        {this.renderInfobox()}
      </>
    );
  }

  renderMap () {
    return <h2>Map (placeholder)</h2>;
  }

  renderInfobox () {
    const { getData } = this.props.trace;
    const { properties: trace } = getData();
    return (
      <>
        <h2>id</h2>
        <p>{trace.id}</p>
        <h2>Description</h2>
        <p>{trace.description}</p>
        <h2>Length</h2>
        <p>{trace.length}</p>
        <h2>Owner</h2>
        <p>{trace.ownerId}</p>
        <h2>Recorded at</h2>
        <p>{new Date(trace.recordedAt).toLocaleDateString()}</p>
        <h2>Uploaded at</h2>
        <p>{new Date(trace.uploadedAt).toLocaleDateString()}</p>
        <h2>Updated at</h2>
        <p>{new Date(trace.updatedAt).toLocaleDateString()}</p>
      </>
    );
  }

  render () {
    return (
      <App pageTitle='Traces'>
        <Inpage>
          <InpageHeader>
            <InpageHeaderInner>
              <InpageHeadline>
                <InpageTitle>Trace</InpageTitle>
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
