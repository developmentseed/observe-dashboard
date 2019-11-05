import React from 'react';
import { connect } from 'react-redux';
import { PropTypes as T } from 'prop-types';
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
    const { isReady, hasError } = this.props.traces;

    if (!isReady()) return null;
    if (hasError()) return <p>Something went wrong. Try again.</p>;

    return (
      <>
        {this.renderFilters()}
        {this.renderPagination()}
        {this.renderTable()}
      </>
    );
  }

  renderFilters () {
    return (
      <>
        <input type='text' placeholder='Search by user' />
        <input type='text' placeholder='Start date' />
        <input type='text' placeholder='End date' />
        <input type='text' placeholder='Length' />
      </>
    );
  }

  renderPagination () {
    return (
      <>
        <div>1 - 20 of 26</div>
        <button type='button'>{'<'}</button>
        <button type='button'>{'>'}</button>
      </>
    );
  }

  renderTable () {
    return (
      <table>
        <thead>
          <tr>
            <th scope='col' />
            <th scope='col'>
              <span>Trace</span>
            </th>
            <th scope='col'>
              <span>User</span>
            </th>
            <th scope='col'>
              <span>Date</span>
            </th>
            <th scope='col'>
              <span>Length</span>
            </th>
            <th scope='col'>
              <span>Export to JOSM</span>
            </th>
            <th scope='col'>
              <span>Download</span>
            </th>
            <th scope='col'>
              <span>Delete</span>
            </th>
          </tr>
        </thead>
        <tbody>{this.renderTableRows()}</tbody>
      </table>
    );
  }

  renderTableRows () {
    const { getData } = this.props.traces;
    return getData().map(trace => {
      return (
        <tr key={trace.id}>
          <td>
            <input type='checkbox' />
          </td>
          <td>{trace.id}</td>
          <td>{trace.ownerId}</td>
          <td>{new Date(trace.recordedAt).toLocaleDateString()}</td>
          <td>{trace.length}</td>
          <td>JOSM Icon</td>
          <td>Download Icon</td>
          <td>Delete Icon</td>
        </tr>
      );
    });
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
