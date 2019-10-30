import React from 'react';
import { connect } from 'react-redux';
import { PropTypes as T } from 'prop-types';
import { environment } from '../../config';
import * as actions from '../../redux/actions/traces';
import { showGlobalLoading, hideGlobalLoading } from '../common/GlobalLoading';

import App from '../common/app';
import {
  Inpage,
  InpageHeader,
  InpageHeaderInner,
  InpageHeadline,
  InpageTitle,
  InpageBody,
  InpageBodyInner
} from '../common/Inpage';
import Prose from '../../styles/type/prose';
import { wrapApiResult } from '../../redux/utils';

class Traces extends React.Component {
  async componentDidMount () {
    showGlobalLoading();
    await this.props.fetchTraces();
    hideGlobalLoading();
  }

  renderContent () {
    const { isReady, hasError, getMeta } = this.props.traces;

    if (!isReady()) return null;
    if (hasError()) return <p>Something went wrong. Try again.</p>;

    const { totalCount } = getMeta();

    // return <p>${meta.totalCount} traces found.</p>;
    return <p>{totalCount} traces found.</p>;
  }

  render () {
    return (
      <App pageTitle='Traces'>
        <Inpage>
          <InpageHeader>
            <InpageHeaderInner>
              <InpageHeadline>
                <InpageTitle>Traces</InpageTitle>
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
    fetchTraces: T.func,
    traces: T.object
  };
}

function mapStateToProps (state) {
  return {
    traces: wrapApiResult(state.traces)
  };
}

function dispatcher (dispatch) {
  return {
    fetchTraces: (...args) => dispatch(actions.fetchTraces(...args))
  };
}

export default connect(
  mapStateToProps,
  dispatcher
)(Traces);
