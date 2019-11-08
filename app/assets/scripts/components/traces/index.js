import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { PropTypes as T } from 'prop-types';
import { environment } from '../../config';
import * as actions from '../../redux/actions/traces';
import { showGlobalLoading, hideGlobalLoading } from '../common/global-loading';

import App from '../common/app';
import {
  Inpage,
  InpageHeader,
  InpageHeadline,
  InpageTitle,
  InpageBody,
  InpageBodyInner
} from '../common/Inpage';
import Form from '../../styles/form/form';
import FormInput from '../../styles/form/input';
import {
  FilterToolbar,
  InputWrapper,
  InputWithIcon,
  InputIcon,
  FilterLabel } from '../../styles/form/filters';
import { FormCheckable } from '../../styles/form/checkable';
import DataTable from '../../styles/table';
import Pagination from '../../styles/button/pagination';
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
        {this.renderResults()}
      </>
    );
  }

  renderFilters () {
    return (
      <Form>
        <FilterToolbar>
          <InputWrapper>
            <FilterLabel htmlFor='userSearch'>Search by user</FilterLabel>
            <InputWithIcon type='text' id='userSearch' placeholder='User Name' />
            <InputIcon htmlFor='userSearch' useIcon='magnifier-left' />
          </InputWrapper>
          <InputWrapper>
            <FilterLabel htmlFor='startDate'>Start Date</FilterLabel>
            <InputWithIcon type='date' id='startDate' />
            <InputIcon htmlFor='startDate' useIcon='calendar' />
          </InputWrapper>
          <InputWrapper>
            <FilterLabel htmlFor='endDate'>End Date</FilterLabel>
            <InputWithIcon type='date' id='endDate' placeholder='End date' />
            <InputIcon htmlFor='endDate' useIcon='calendar' />
          </InputWrapper>
          <InputWrapper>
            <FilterLabel htmlFor='length'>Trace Length</FilterLabel>
            <FormInput type='select' id='length' placeholder='Length' />
          </InputWrapper>
        </FilterToolbar>
      </Form>
    );
  }

  renderResults () {
    const { getMeta } = this.props.traces;
    const { count } = getMeta();

    if (count === 0) {
      return (
        <p>There are no results for the current search/filters criteria.</p>
      );
    }

    return (
      <>
        {this.renderTable()}
        <Pagination />
      </>
    );
  }

  renderTable () {
    return (
      <DataTable>
        <thead>
          <tr>
            <th scope='col'>
              <FormCheckable
                checked={undefined}
                type='checkbox'
                name='checkbox-all'
                id='checkbox-all'
              />
            </th>
            <th scope='col'>
              Trace
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
      </DataTable>
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
          <td>
            <Link to={`/traces/${trace.id}`}>{trace.id}</Link>
          </td>
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
          <InpageHeader />
          <InpageBody>
            <InpageBodyInner>
              <InpageHeadline>
                <InpageTitle>Traces</InpageTitle>
              </InpageHeadline>
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
