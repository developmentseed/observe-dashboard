import React, { Component } from 'react';
import { PropTypes as T } from 'prop-types';
import styled from 'styled-components';
import InputRange from 'react-input-range';

import { FormGroupBody, FormGroupHeader, FormGroup } from '../../styles/form/group';
import FormLabel from '../../styles/form/label';

import { visuallyHidden } from '../../styles/helpers';
import { validateRangeNum } from '../../utils/utils';
import StressedFormGroupInput from './stressed-form-group-input';

const FormSliderGroup = styled.div`
  display: grid;
  align-items: center;
  grid-gap: 1rem;
  grid-template-columns: ${({ isRange }) => isRange ? '3rem 1fr 3rem' : '1fr 3rem'};

  label {
    ${visuallyHidden()}
  }
`;

class RangeSlider extends Component {
  render () {
    const {
      min,
      max,
      id,
      label,
      value,
      onChange
    } = this.props;

    const isRange = typeof value === 'object';
    return (
      <FormGroup key={id}>
        <FormGroupHeader>
          <FormLabel htmlFor={`slider-${id}`}>{label}</FormLabel>
        </FormGroupHeader>
        <FormGroupBody>
          <FormSliderGroup isRange={isRange}>
            {isRange && (
              <StressedFormGroupInput
                inputType='number'
                inputSize='small'
                id={`slider-input-min-${id}`}
                name={`slider-input-min-${id}`}
                label='Min value'
                value={value.min.toString()}
                validate={validateRangeNum(min, value.max)}
                onChange={v => onChange({ ...value, min: Number(v) })}
              />
            )}
            <InputRange
              minValue={min}
              maxValue={max}
              name={`slider-${id}`}
              id={`slider-${id}`}
              value={value}
              onChange={onChange}
            />
            <StressedFormGroupInput
              inputType='number'
              inputSize='small'
              id={`slider-input-max-${id}`}
              name={`slider-input-max-${id}`}
              label='Max value'
              value={isRange ? value.max.toString() : value.toString()}
              validate={validateRangeNum(isRange ? value.min : min, max)}
              onChange={v => onChange(isRange
                ? { ...value, max: Number(v) }
                : Number(v)
              )}
            />
          </FormSliderGroup>
        </FormGroupBody>
      </FormGroup>
    );
  }
}

RangeSlider.propTypes = {
  min: T.number,
  max: T.number,
  id: T.string,
  label: T.string,
  value: T.oneOfType([T.object, T.number]),
  onChange: T.func
};

export default RangeSlider;
