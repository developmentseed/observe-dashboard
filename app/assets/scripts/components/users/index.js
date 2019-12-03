import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { PropTypes as T } from 'prop-types';
import get from 'lodash.get';
import { environment } from '../../config';
import * as actions from '../../redux/actions/users';
import { showGlobalLoading, hideGlobalLoading } from '../common/global-loading';

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

class Users extends React.Component {
  constructor (props) {
    super(props);

    this.updateData = this.updateData.bind(this);
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
    const searchParams = this.props.location.search;
    await this.props.fetchUsers(searchParams);
    hideGlobalLoading();
  }

  async deleteTrace (e, userId) {
    e.preventDefault();

    // Confirm delete
    const { result } = await confirmDeleteItem('user', userId);

    // When delete is confirmed
    if (result) {
      showGlobalLoading();

      try {
        // Make delete request
        await this.props.deleteTrace(userId);

        // Refresh table if successful
        this.updateData();

        // Show success toast.
        toasts.info(`Trace ${userId} was successfully deleted.`);
      } catch (error) {
        // Show error toast.
        toasts.error(`An error occurred, user ${userId} was not deleted.`);
      }

      hideGlobalLoading();
    }
  }

  renderContent () {
    const { isReady, hasError } = this.props.users;

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
            <InputWithIcon
              type='text'
              id='userSearch'
              placeholder='User Name'
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

    return (
      <>
        {this.renderTable()}
        <Pagination pathname='/users' meta={meta} />
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
        <tr key={user.id}>
          <td>
            <Link to={`/users/${user.osmDisplayName}`}>
              {user.osmDisplayName}
            </Link>
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
              {user.isAdmin ? 'Promote' : 'Demote'}
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
    users: T.object,
    location: T.object,
    deleteTrace: T.func
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
    deleteTrace: (...args) => dispatch(actions.deleteTrace(...args))
  };
}

export default connect(mapStateToProps, dispatcher)(Users);
