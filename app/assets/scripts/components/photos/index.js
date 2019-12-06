import React from 'react';
import { connect } from 'react-redux';
import { PropTypes as T } from 'prop-types';
import { Link } from 'react-router-dom';
import { environment, osmUrl } from '../../config';
import * as actions from '../../redux/actions/photos';
import { showGlobalLoading, hideGlobalLoading } from '../common/global-loading';
import DataTable from '../../styles/table';
import QsState from '../../utils/qs-state';

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
import FormSelect from '../../styles/form/select';
import {
  FilterToolbar,
  InputWrapper,
  InputWithIcon,
  InputIcon,
  FilterLabel
} from '../../styles/form/filters';

import Pagination from '../../styles/button/pagination';
import Prose from '../../styles/type/prose';
import { wrapApiResult } from '../../redux/utils';
import { featureToCoords } from '../../utils';
import FormInput from '../../styles/form/input';
import Button from '../../styles/button/button';

class Photos extends React.Component {
  constructor (props) {
    super(props);

    this.updateData = this.updateData.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleFilterSubmit = this.handleFilterSubmit.bind(this);

    // Setup the qsState for url state management.
    this.qsState = new QsState({
      page: {
        accessor: 'page',
        default: 1
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
      osmElementType: {
        accessor: 'filterValues.osmElementType'
      },
      osmElementId: {
        accessor: 'filterValues.osmElementId'
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
      filterValues: {
        username,
        startDate,
        endDate,
        osmElementType,
        osmElementId
      }
    } = this.qsState.getState(this.props.location.search.substr(1));

    // Execute update action
    await this.props.fetchPhotos({
      page,
      limit,
      sort,
      username,
      startDate,
      endDate,
      osmElementType,
      osmElementId
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
      filterValues: {
        ...filterValues,
        [id]: value
      }
    });
  }

  renderContent () {
    const { isReady, hasError } = this.props.photos;

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
    const {
      username,
      startDate,
      endDate,
      osmElementType,
      osmElementId
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
            <FormInput
              type='text'
              id='username'
              placeholder='User Name'
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
              onChange={this.handleFilterChange}
              onKeyDown={submitOnEnter}
              value={startDate}
            />
            <InputIcon htmlFor='startDate' useIcon='calendar' />
          </InputWrapper>
          <InputWrapper>
            <FilterLabel htmlFor='endDate'>End Date</FilterLabel>
            <InputWithIcon
              type='date'
              id='endDate'
              onChange={this.handleFilterChange}
              onKeyDown={submitOnEnter}
              value={endDate}
            />
            <InputIcon htmlFor='endDate' useIcon='calendar' />
          </InputWrapper>
          <InputWrapper>
            <FilterLabel htmlFor='osmElementType'>OSM Element Type</FilterLabel>
            <FormSelect
              value={osmElementType}
              onChange={this.handleFilterChange}
              onKeyDown={submitOnEnter}
              type='select'
              id='osmElementType'
            >
              <option value=''>Any</option>
              <option value='node'>Node</option>
              <option value='way'>Way</option>
              <option value='relation'>Relation</option>
            </FormSelect>
          </InputWrapper>
          <InputWrapper>
            <FilterLabel htmlFor='username'>OSM Element Id</FilterLabel>
            <FormInput
              type='number'
              id='osmElementId'
              placeholder='OSM id'
              onChange={this.handleFilterChange}
              onKeyDown={submitOnEnter}
              value={osmElementId}
              autoComplete='off'
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
    const { getMeta } = this.props.photos;
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

    // Get querystring by merging with state to keep filters
    const getQs = page =>
      this.qsState.getQs({
        ...this.state,
        page
      });

    return (
      <>
        {this.renderTable()}
        <Pagination
          pathname='/photos'
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
          variation='base-plain-semidark'
          to={`/photos?${nextSortLink()}`}
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
            <th scope='col'>{this.renderColumnHead('Owner', 'username')}</th>
            <th scope='col'>{this.renderColumnHead('Date', 'createdAt')}</th>
            <th scope='col'>
              <span>Coordinates</span>
            </th>
            <th scope='col'>
              {this.renderColumnHead('OSM Element', 'osmElement')}
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
            <Link to={`/photos/${photo.id}`}>{photo.id}</Link>
          </td>
          <td>{photo.ownerDisplayName}</td>
          <td>{new Date(photo.createdAt).toLocaleDateString()}</td>
          <td>{featureToCoords(photo.location)}</td>
          <td>
            {photo.osmElement ? (
              <a
                target='_blank'
                rel='noopener noreferrer'
                href={`${osmUrl}/${photo.osmElement}`}
              >
                {photo.osmElement}
              </a>
            ) : (
              '-'
            )}
          </td>
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
    history: T.object,
    photos: T.object,
    location: T.object
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

export default connect(mapStateToProps, dispatcher)(Photos);
