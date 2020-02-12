import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { filterComponentProps } from '../../utils';
import { osmUrl } from '../../config';

/**
 * A base Link component ready to be used with styled component without warnings
 */
const StyledLink = filterComponentProps(Link, ['hideText', 'useIcon', 'variation']);

/**
 * Link to OpenStreetMap Profile
 */
export const LinkToOsmProfile = ({ osmDisplayName, className }) => {
  return (
    <a
      className={className}
      href={`${osmUrl}/user/${osmDisplayName}`}
      target='_blank'
      rel='noopener noreferrer'
    >
      {osmDisplayName}
    </a>
  );
};
LinkToOsmProfile.propTypes = {
  osmDisplayName: PropTypes.string.isRequired,
  className: PropTypes.string
};

export default StyledLink;
