import React from 'react';
import { connect } from 'react-redux';
import { PropTypes as T } from 'prop-types';
import { Link } from 'react-router-dom';
import { environment } from '../../config';
import * as actions from '../../redux/actions/photos';
import { showGlobalLoading, hideGlobalLoading } from '../common/global-loading';
import DataTable from '../../styles/table';

import App from '../common/app';
import {
  Inpage,
  InpageHeader,
  InpageHeadline,
  InpageTitle,
  InpageBody,
  InpageBodyInner
} from '../common/inpage';

import Form from '../../styles/form/form';
import { FormCheckable } from '../../styles/form/checkable';
import FormInput from '../../styles/form/input';
import {
  FilterToolbar,
  InputWrapper,
  InputWithIcon,
  InputIcon,
  FilterLabel } from '../../styles/form/filters';

import Pagination from '../../styles/button/pagination';
import Prose from '../../styles/type/prose';
import { wrapApiResult } from '../../redux/utils';
import { featureToCoords } from '../../utils';

class Photos extends React.Component {
  async componentDidMount () {
    showGlobalLoading();
    await this.props.fetchPhotos();
    hideGlobalLoading();
  }

  renderContent () {
    const { isReady, hasError } = this.props.photos;

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
            <FilterLabel htmlFor='length'>OSM Object</FilterLabel>
            <FormInput type='select' id='length' placeholder='Length' />
          </InputWrapper>
        </FilterToolbar>
      </Form>
    );
  }

  renderResults () {
    const { getMeta } = this.props.photos;
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
              <span>Photo</span>
            </th>
            <th scope='col'>
              <span>User</span>
            </th>
            <th scope='col'>
              <span>Date</span>
            </th>
            <th scope='col'>
              <span>Coordinates</span>
            </th>
            <th scope='col'>
              <span>OSM Objects</span>
            </th>
            <th scope='col'>
              <span>Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>{this.renderTableRows()}</tbody>
      </DataTable>
    );
  }

  renderTableRows () {
    const { getData } = this.props.photos;
    return getData().map(photo => {
      return (
        <tr key={photo.id}>
          <td>
            <input type='checkbox' />
          </td>
          <td>
            <Link to={`/photos/${photo.id}`}>{photo.id}</Link>
          </td>
          <td>{photo.ownerId}</td>
          <td>{new Date(photo.createdAt).toLocaleDateString()}</td>
          <td>{featureToCoords(photo.location)}</td>
          <td>W W N</td>
          <td>...</td>
        </tr>
      );
    });
  }

  render () {
    return (
      <App pageTitle='Photos'>
        <Inpage>
          <InpageHeader />
          <InpageBody>
            <InpageBodyInner>
              <InpageHeadline>
                <InpageTitle>Photos</InpageTitle>
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
  Photos.propTypes = {
    fetchPhotos: T.func,
    photos: T.object
  };
}

function mapStateToProps (state) {
  return {
    photos: wrapApiResult(state.photos)
  };
}

function dispatcher (dispatch) {
  return {
    fetchPhotos: (...args) => dispatch(actions.fetchPhotos(...args))
  };
}

export default connect(
  mapStateToProps,
  dispatcher
)(Photos);
