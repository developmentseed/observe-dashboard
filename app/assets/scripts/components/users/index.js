import React from 'react';
import { connect } from 'react-redux';
import { PropTypes as T } from 'prop-types';
import get from 'lodash.get';
import { environment, osmUrl, pageLimit } from '../../config';
import * as actions from '../../redux/actions/users';
import { showGlobalLoading, hideGlobalLoading } from '../common/global-loading';
import QsState from '../../utils/qs-state';

import App from '../common/app';
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

class Users extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      page: 1,
      limit: pageLimit,
      filterValues: {}
    };

    this.fetchData = this.fetchData.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleFilterSubmit = this.handleFilterSubmit.bind(this);

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

    await this.fetchData();
  }

  async componentDidUpdate (prevProps) {
    if (prevProps.location.search !== this.props.location.search) {
      await this.fetchData();
    }
  }

  async fetchData () {
    showGlobalLoading();
    const searchParams = this.props.location.search;
    await this.props.fetchUsers(searchParams);
    hideGlobalLoading();
  }

  async updateUser (e, user, values) {
    showGlobalLoading();
    try {
      // Make delete request
      await this.props.updateUser(user.osmId, values);

      // Refresh table if successful
      this.fetchData();

      // Show success toast.
      toasts.info(`User ${user.osmDisplayName} was successfully updated.`);
    } catch (error) {
      // Show error toast.
      toasts.error(
        `An error occurred, user ${user.osmDisplayName} was not updated.`
      );
    }
    hideGlobalLoading();
  }

  handleFilterSubmit (e) {
    this.setState({ page: 1 });

    // Update location.
    const qString = this.qsState.getQs(this.state);
    this.props.history.push({ search: qString });
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
      filterValues: {
        ...filterValues,
        [id]: value
      }
    });
  }

  renderContent () {
    const { isReady, hasError } = this.props.users;

    if (!isReady()) return null;

    return (
      <>
        {this.renderFilters()}
        {hasError() ? (
          <p>Something went wrong. Try again.</p>
        ) : (
          this.renderResults()
        )}
      </>
    );
  }

  renderFilters () {
    const { username } = this.state.filterValues;

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
            <FilterLabel htmlFor='userSearch'>Search by user</FilterLabel>
            <InputWithIcon
              type='text'
              id='username'
              placeholder='User Name'
              onChange={this.handleFilterChange}
              onKeyDown={submitOnEnter}
              value={username}
              autoFocus
              autoComplete='off'
            />
            <InputIcon htmlFor='userSearch' useIcon='magnifier-left' />
          </InputWrapper>
        </FilterToolbar>
      </Form>
    );
  }

  renderResults () {
    const { getMeta } = this.props.users;
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
          pathname='/users'
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
    const { isAdmin } = this.props.authenticatedUser.getData();
    return (
      <DataTable>
        <thead>
          <tr>
            <th scope='col'>
              <span>ID</span>
            </th>
            <th scope='col'>
              <span>Mapper Since</span>
            </th>
            <th scope='col'>
              <span>Traces</span>
            </th>
            <th scope='col' style={{ width: '10%', textAlign: 'center' }}>
              <span>Photos</span>
            </th>
            <th scope='col' style={{ width: '10%', textAlign: 'center' }}>
              <span>Admin</span>
            </th>
            {isAdmin && (
              <th scope='col' style={{ width: '10%', textAlign: 'center' }}>
                <span>Action</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>{this.renderTableRows()}</tbody>
      </DataTable>
    );
  }

  renderTableRows () {
    const { getData } = this.props.users;
    const { isAdmin } = this.props.authenticatedUser.getData();

    return getData().map(user => {
      return (
        <tr key={user.osmId}>
          <td>
            <a
              target='_blank'
              rel='noopener noreferrer'
              href={`${osmUrl}/user/${user.osmDisplayName}`}
            >
              {user.osmDisplayName}
            </a>
          </td>
          <td>{new Date(user.osmCreatedAt).toLocaleDateString()}</td>
          <td>{user.traces}</td>
          <td>{user.photos}</td>
          <td style={{ textAlign: 'center' }}>
            {user.isAdmin && (
              <Button useIcon='tick' size='small' hideText>
                Admin user
              </Button>
            )}
          </td>
          {isAdmin && (
            <td style={{ textAlign: 'center' }}>
              {!user.isAdmin ? (
                <Button
                  size='small'
                  variation='primary-raised-dark'
                  onClick={e => this.updateUser(e, user, { isAdmin: true })}
                >
                  Promote
                </Button>
              ) : (
                <Button
                  size='small'
                  variation='danger-raised-dark'
                  onClick={e => this.updateUser(e, user, { isAdmin: false })}
                >
                  Demote
                </Button>
              )}
            </td>
          )}
        </tr>
      );
    });
  }

  render () {
    return (
      <App pageTitle='Users'>
        <Inpage>
          <InpageHeader />
          <InpageBody>
            <InpageBodyInner>
              <InpageHeadline>
                <InpageTitle>Users</InpageTitle>
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
  Users.propTypes = {
    authenticatedUser: T.object,
    fetchUsers: T.func,
    history: T.object,
    location: T.object,
    updateUser: T.func,
    users: T.object
  };
}

function mapStateToProps (state) {
  return {
    users: wrapApiResult(state.users),
    authenticatedUser: wrapApiResult(state.authenticatedUser),
    accessToken: get(state, 'authenticatedUser.data.accessToken')
  };
}

function dispatcher (dispatch) {
  return {
    fetchUsers: (...args) => dispatch(actions.fetchUsers(...args)),
    updateUser: (...args) => dispatch(actions.updateUser(...args))
  };
}

export default connect(mapStateToProps, dispatcher)(Users);