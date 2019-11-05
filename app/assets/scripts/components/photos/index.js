import React from 'react';
import { connect } from 'react-redux';
import { PropTypes as T } from 'prop-types';
import { environment } from '../../config';
import * as actions from '../../redux/actions/photos';
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

import Pagination from '../../styles/button/pagination';
import Prose from '../../styles/type/prose';
import { wrapApiResult } from '../../redux/utils';

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
      <>
        <input type='text' placeholder='Search by user' />
        <input type='text' placeholder='Start date' />
        <input type='text' placeholder='End date' />
        <input type='text' placeholder='OSM Object' />
      </>
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
      </table>
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
          <td>{photo.id}</td>
          <td>{photo.ownerId}</td>
          <td>{new Date(photo.createdAt).toLocaleDateString()}</td>
          <td>x,y</td>
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
          <InpageHeader>
            <InpageHeaderInner>
              <InpageHeadline>
                <InpageTitle>Photos</InpageTitle>
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
