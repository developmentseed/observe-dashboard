import styled from 'styled-components';

import collecticon from '../collecticons';
import Button from './button';

const ButtonCaret = styled(Button)`
  ::after {
    ${collecticon('triangle-down')}
  }
`;

export default ButtonCaret;
