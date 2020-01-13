import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { PropTypes as T } from 'prop-types';
import get from 'lodash.get';
import { environment } from '../../config';
import * as actions from '../../redux/actions/traces';
import { showGlobalLoading, hideGlobalLoading } from '../common/global-loading';
import { handleExportToJosm, downloadTrace, convertMeter2Kilometer } from './utils';
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
import { getUTCDate } from '../../utils';

class Traces extends React.Component {
  constructor (props) {
    super(props);

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
      sort: {
        accessor: 'sort'
      },
      username: {
        accessor: 'filterValues.username'
      },
      startDate: {
        accessor: 'filterValues.startDate'
      },
      endDate: {
        accessor: 'filterValues.endDate'
      },
      lengthMin: {
        accessor: 'filterValues.lengthMin'
      },
      lengthMax: {
        accessor: 'filterValues.lengthMax'
      }
    });

    this.state = this.qsState.getState(this.props.location.search.substr(1));
  }

  async componentDidMount () {
    await this.updateData();
  }

  async componentDidUpdate (prevProps) {
    if (prevProps.location.search !== this.props.location.search) {
      await this.updateData();
    }
  }

  async updateData () {
    showGlobalLoading();

    // Get query params from state
    const {
      page,
      limit,
      sort,
      filterValues: { username, startDate, endDate, lengthMin, lengthMax }
    } = this.qsState.getState(this.props.location.search.substr(1));

    await this.props.fetchTraces({
      page,
      limit,
      sort,
      username,
      startDate,
      endDate,
      lengthMin,
      lengthMax
    });

    hideGlobalLoading();
  }

  handleFilterSubmit (e) {
    this.setState({ page: 1 }, () => {
      const qString = this.qsState.getQs(this.state);
      this.props.history.push({ search: qString });
    });
  }

  handleFilterChange (e) {
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
    const {
      username,
      startDate,
      endDate,
      lengthMin,
      lengthMax
    } = this.state.filterValues;

    const submitOnEnter = e => {
      if (e.key === 'Enter') {
        this.handleFilterChange(e);
        this.handleFilterSubmit();
      }
    };

    return (
      <Form>
        <FilterToolbar>
          <InputWrapper>
            <FilterLabel htmlFor='username'>Search by user</FilterLabel>
            <InputWithIcon
              type='text'
              id='username'
              placeholder='User name'
              onChange={this.handleFilterChange}
              onKeyDown={submitOnEnter}
              value={username}
              autoFocus
              autoComplete='off'
            />
          </InputWrapper>
          <InputWrapper>
            <FilterLabel htmlFor='startDate'>Start Date</FilterLabel>
            <InputWithIcon
              type='date'
              id='startDate'
              value={startDate}
              onKeyDown={submitOnEnter}
              onChange={this.handleFilterChange}
            />
            <InputIcon htmlFor='startDate' useIcon='calendar' />
          </InputWrapper>
          <InputWrapper>
            <FilterLabel htmlFor='endDate'>End Date</FilterLabel>
            <InputWithIcon
              type='date'
              id='endDate'
              value={endDate}
              onKeyDown={submitOnEnter}
              onChange={this.handleFilterChange}
            />
            <InputIcon htmlFor='endDate' useIcon='calendar' />
          </InputWrapper>
          <InputWrapper>
            <FilterLabel htmlFor='lengthMin'>From length</FilterLabel>
            <InputWithIcon
              type='number'
              id='lengthMin'
              value={lengthMin}
              placeholder='Min. value'
              onKeyDown={submitOnEnter}
              onChange={this.handleFilterChange}
            />
          </InputWrapper>
          <InputWrapper>
            <FilterLabel htmlFor='lengthMax'>To length</FilterLabel>
            <InputWithIcon
              type='number'
              id='lengthMax'
              placeholder='Max. value'
              value={lengthMax}
              onKeyDown={submitOnEnter}
              onChange={this.handleFilterChange}
            />
          </InputWrapper>
          <Button
            variation='primary-raised-dark'
            onClick={this.handleFilterSubmit}
          >
            Apply filters
          </Button>
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

    // Merge page into current query string
    const getQs = page =>
      this.qsState.getQs({
        ...this.qsState.getState(this.props.location.search.substr(1)),
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

  renderColumnHead (label, property) {
    const state = this.qsState.getState(this.props.location.search.substr(1));

    // Update sort on querystring
    const getQs = direction =>
      this.qsState.getQs({
        ...state,
        sort: {
          [property]: direction
        }
      });

    // Get next sort state link
    const nextSortLink = () => {
      if (!state.sort || !state.sort[property]) {
        return getQs('asc');
      } else {
        const direction = state.sort[property];
        if (direction === 'asc') return getQs('desc');
        else return getQs();
      }
    };

    const getIcon = () => {
      if (!state.sort || !state.sort[property]) {
        return 'sort-none';
      } else {
        const direction = state.sort[property];
        if (direction === 'asc') return 'sort-asc';
        else if (direction === 'desc') return 'sort-desc';
        else return 'sort-desc';
      }
    };

    return (
      <>
        <span>{label}</span>
        <Button
          as={Link}
          useIcon={getIcon()}
          variation='base-plain'
          to={`/traces?${nextSortLink()}`}
          hideText
        >
          <span>sort</span>
        </Button>
      </>
    );
  }

  renderTable () {
    return (
      <DataTable>
        <thead>
          <tr>
            <th scope='col'>{this.renderColumnHead('ID', 'id')}</th>
            <th scope='col'>
              {this.renderColumnHead('Recorded At', 'recordedAt')}
            </th>
            <th scope='col'>{this.renderColumnHead('Owner', 'username')}</th>
            <th scope='col'>{this.renderColumnHead('Length', 'length')}</th>
            <th scope='col' style={{ width: '13%', textAlign: 'center' }}>
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
    const { isAdmin, osmId: userId } = this.props.authenticatedUser.getData();
    const { getData } = this.props.traces;
    const { accessToken } = this.props;

    return getData().map(trace => {
      return (
        <tr key={trace.id}>
          <td>
            <Link to={`/traces/${trace.id}`}>{trace.id}</Link>
          </td>
          <td>{getUTCDate(trace.recordedAt)}</td>
          <td>{trace.ownerDisplayName}</td>
          <td>{convertMeter2Kilometer(trace.length).length} {convertMeter2Kilometer(trace.length).unit}</td>
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
              disabled={!(isAdmin || userId === trace.ownerId)}
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
    authenticatedUser: T.object,
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
    accessToken: get(state, 'authenticatedUser.data.accessToken'),
    authenticatedUser: wrapApiResult(state.authenticatedUser)
  };
}

function dispatcher (dispatch) {
  return {
    fetchTraces: (...args) => dispatch(actions.fetchTraces(...args)),
    deleteTrace: (...args) => dispatch(actions.deleteTrace(...args))
  };
}

export default connect(mapStateToProps, dispatcher)(Traces);
