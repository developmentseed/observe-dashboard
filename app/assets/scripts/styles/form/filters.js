import styled from 'styled-components';
import FormInput from './input';
import FormLabel from './label';
import FormToolbar from './toolbar';
import collecticon from '../collecticons';
import { themeVal } from '../utils/general';

export const FilterToolbar = styled(FormToolbar)`
  align-items: flex-end;
`;

export const InputWrapper = styled.div`
  position: relative;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-end;
  &:not(:first-child) {
    margin-left: 1rem !important;
  }
`;

export const InputWithIcon = styled(FormInput)`
  padding-right: 1.25rem;
`;

export const InputIcon = styled(FormLabel)`
  &::after {
    ${({ useIcon }) => collecticon(useIcon)}
    position: absolute;
    right: 0.25rem;
    top: 50%;
    opacity: 0.64;
  }
`;

export const FilterLabel = styled(FormLabel)`
  font-size: 0.875rem;
  font-weight: ${themeVal('type.base.regular')};
`;
