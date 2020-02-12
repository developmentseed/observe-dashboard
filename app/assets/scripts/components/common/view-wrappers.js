import styled from 'styled-components';
import { cardSkin } from '../../styles/skins';
import { themeVal } from '../../styles/utils/general';

export const ContentWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-contents: space-between;
  > * {
    flex: 1;
  }
`;

export const Infobox = styled.div`
  ${cardSkin()}
  margin-left: 4rem;
  padding: 2rem;

  form {
    grid-gap: 0;

    label {
      color: ${themeVal('color.primary')};
      letter-spacing: 0.4;
      font-size: 0.875rem;
      &:not(:first-child) {
        margin-top: 0.5rem;
      }
    }
    ul, li {
      list-style: none;
      margin: 0;
    }
  }
`;

export const ActionButtonsWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1.67rem;
  > *:not(:last-child) {
    margin-right: 2rem;
  }
`;
