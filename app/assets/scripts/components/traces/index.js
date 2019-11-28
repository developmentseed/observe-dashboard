import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { PropTypes as T } from 'prop-types';
import styled from 'styled-components';
import get from 'lodash.get';
import { environment, pageLimit } from '../../config';
import * as actions from '../../redux/actions/traces';
import { showGlobalLoading, hideGlobalLoading } from '../common/global-loading';
import { handleExportToJosm, downloadTrace } from './utils';
import QsState from '../../utils/qs-state';

import App from '../common/app';
import { confirmDeleteItem } from '../common/confirmation-prompt';
import toasts from '../common/toasts';
import {
  Inpage,
  InpageHeader,
  InpageHeadline,
  InpageTitle,
  InpageBody,
  InpageBodyInner
} from '../common/inpage';
import Button from '../../styles/button/button';
import Form from '../../styles/form/form';
import FormInput from '../../styles/form/input';
import {
  FilterToolbar,
  InputWrapper,
  InputWithIcon,
  InputIcon,
  FilterLabel
} from '../../styles/form/filters';
import DataTable from '../../styles/table';
import Pagination from '../../styles/button/pagination';
import Prose from '../../styles/type/prose';
import { wrapApiResult } from '../../redux/utils';
import Dropdown from '../common/dropdown';
import RangeSlider from '../common/range-slider';

const DropSlider = styled(Dropdown)`
  max-width: 24rem;
  padding-bottom: 2rem;
`;

class Traces extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      traceLength: {
        min: 0,
        max: 100
      filterIsTouched: false,
      page: 1,
      limit: pageLimit,
      filterValues: {
        username: ''
      }
    };

    this.updateData = this.updateData.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleFilterSubmit = this.handleFilterSubmit.bind(this);
    this.renderResults = this.renderResults.bind(this);

    // Setup the qsState for url state management.
    this.qsState = new QsState({
      page: {
        accessor: 'page'
      },
      limit: {
        accessor: 'limit'
      },
      username: {
        accessor: 'filterValues.username'
      }
    });
  }

  async componentDidMount () {
    // Load location search into state
    let qsState = this.qsState.getState(this.props.location.search.substr(1));
    Object.keys(qsState).forEach(k => {
      if (qsState[k] === undefined) delete qsState[k];
    });
    this.setState(qsState);

    await this.updateData();
  }

  async componentDidUpdate (prevProps) {
    if (prevProps.location.search !== this.props.location.search) {
      await this.updateData();
    }
  }

  async updateData () {
    showGlobalLoading();
    const searchParams = this.props.location.search;
    await this.props.fetchTraces(searchParams);
    hideGlobalLoading();
  }

  handleFilterSubmit (e) {
    e.preventDefault();

    const { filterIsTouched } = this.state;
    if (filterIsTouched) {
      // When making new query, reset to page one
      this.setState({ page: 1, filterIsTouched: false });

      // Update location.
      const qString = this.qsState.getQs(this.state);
      this.props.history.push({ search: qString });

      this.updateData();
    }
  }

  handleFilterChange (e) {
    e.preventDefault();

    // Get id/value pair from event
    const { id, value } = e.target;

    const currentValue = this.state.filterValues[id];

    // Filter values haven't changed, return
    if (currentValue === value) return;

    // Update value and marked is filters as touched
    const { filterValues } = this.state;
    this.setState({
      filterIsTouched: true,
      filterValues: {
        ...filterValues,
        [id]: value
      }
    });
  }

  async deleteTrace (e, traceId) {
    e.preventDefault();

    // Confirm delete
    const { result } = await confirmDeleteItem('trace', traceId);

    // When delete is confirmed
    if (result) {
      showGlobalLoading();

      try {
        // Make delete request
        await this.props.deleteTrace(traceId);

        // Refresh table if successful
        this.updateData();

        // Show success toast.
        toasts.info(`Trace ${traceId} was successfully deleted.`);
      } catch (error) {
        // Show error toast.
        toasts.error(`An error occurred, trace ${traceId} was not deleted.`);
      }

      hideGlobalLoading();
    }
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
    const { username } = this.state.filterValues;

    return (
      <Form onSubmit={this.handleFilterSubmit}>
        <FilterToolbar>
          <InputWrapper>
            <FilterLabel htmlFor='username'>Search by user</FilterLabel>
            <InputWithIcon
              type='text'
              id='username'
              placeholder='User name'
              onChange={this.handleFilterChange}
              value={username}
              autoFocus
              autoComplete='off'
            />
            <InputIcon
              htmlFor='username'
              useIcon='magnifier-left'
              onClick={this.handleFilterSubmit}
            />
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
            <DropSlider
              ref={this.dropRef}
              alignment='left'
              direction='down'
              triggerElement={
                <FormInput type='select' id='length' placeholder='Length' />
              }
            >
              <Form>
                <RangeSlider
                  min={0}
                  max={100}
                  id='trace-length'
                  value={this.state.traceLength}
                  onChange={v => this.setState({ traceLength: v })}
                />
              </Form>
            </DropSlider>
          </InputWrapper>
        </FilterToolbar>
      </Form>
    );
  }

  renderResults () {
    const { getMeta } = this.props.traces;
    const meta = getMeta();

    if (meta.count === 0) {
      return (
        <p>There are no results for the current search/filters criteria.</p>
      );
    }

    // Get page indexes
    const firstPage = 1;
    const lastPage = meta.pageCount;
    const currentPage = meta.page;
    const previousPage =
      currentPage - 1 < firstPage ? firstPage : currentPage - 1;
    const nextPage = currentPage + 1 > lastPage ? lastPage : currentPage + 1;

    const getQs = page =>
      this.qsState.getQs({
        ...this.state,
        page
      });

    return (
      <>
        {this.renderTable()}
        <Pagination
          pathname='/traces'
          meta={{
            ...meta,
            first: getQs(firstPage),
            previous: getQs(previousPage),
            next: getQs(nextPage),
            last: getQs(lastPage)
          }}
        />
      </>
    );
  }

  renderTable () {
    return (
      <DataTable>
        <thead>
          <tr>
            <th scope='col'>ID</th>
            <th scope='col'>
              <span>Owner</span>
            </th>
            <th scope='col'>
              <span>Date</span>
            </th>
            <th scope='col'>
              <span>Length</span>
            </th>
            <th scope='col' style={{ width: '10%', textAlign: 'center' }}>
              <span>Export to JOSM</span>
            </th>
            <th scope='col' style={{ width: '10%', textAlign: 'center' }}>
              <span>Download</span>
            </th>
            <th scope='col' style={{ width: '10%', textAlign: 'center' }}>
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
    const { accessToken } = this.props;

    return getData().map(trace => {
      return (
        <tr key={trace.id}>
          <td>
            <Link to={`/traces/${trace.id}`}>{trace.id}</Link>
          </td>
          <td>{trace.ownerDisplayName}</td>
          <td>{new Date(trace.recordedAt).toLocaleDateString()}</td>
          <td>{trace.length} m</td>
          <td style={{ textAlign: 'center' }}>
            <Button
              useIcon='share'
              variation='base-plain'
              size='small'
              hideText
              onClick={e => handleExportToJosm(e, trace.id)}
            >
              Export to JOSM
            </Button>
          </td>
          <td style={{ textAlign: 'center' }}>
            <Button
              useIcon='download'
              variation='primary-plain'
              size='small'
              onClick={e => {
                e.preventDefault();
                downloadTrace(accessToken, trace.id);
              }}
              hideText
            >
              Download trace
            </Button>
          </td>
          <td style={{ textAlign: 'center' }}>
            <Button
              useIcon='trash-bin'
              variation='danger-plain'
              size='small'
              hideText
              onClick={e => this.deleteTrace(e, trace.id)}
            >
              Delete trace
            </Button>
          </td>
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
    accessToken: T.string,
    fetchTraces: T.func,
    traces: T.object,
    history: T.object,
    location: T.object,
    deleteTrace: T.func
  };
}

function mapStateToProps (state) {
  return {
    traces: wrapApiResult(state.traces),
    accessToken: get(state, 'authenticatedUser.data.accessToken')
  };
}

function dispatcher (dispatch) {
  return {
    fetchTraces: (...args) => dispatch(actions.fetchTraces(...args)),
    deleteTrace: (...args) => dispatch(actions.deleteTrace(...args))
  };
}

export default connect(mapStateToProps, dispatcher)(Traces);
