import React from 'react';
import styled from 'styled-components';
import { PropTypes } from 'prop-types';
import Button from '../../styles/button/button';
import { multiply } from '../../styles/utils/math';
import { themeVal } from '../../styles/utils/general';

const ModalWindow = styled.div`
    position: fixed;
    padding: ${multiply(themeVal('layout.space'), 2)};
    z-index: 9999;
    background: ${themeVal('color.smoke')};
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const ModalDialog = styled.div`
  position: relative;
  padding: ${multiply(themeVal('layout.space'), 2)};
  border-radius: ${themeVal('shape.rounded')};
  background: #fff;
  display: flex;
  flex-flow: row wrap;
  justify-content: space-around;
  margin-bottom: 8rem;
`;

const DialogText = styled.div`
  margin-bottom: ${themeVal('layout.space')};
  width: 100%;
  display: flex;
  justify-content: center;
`;

const Modal = ({ modalMessage, confirmModalAction, rejectModalAction }) => {
  return (
    <ModalWindow>
      <ModalDialog>
        <DialogText>{modalMessage}</DialogText>
        <Button onClick={confirmModalAction} variation='base-plain'>Yes</Button>
        <Button onClick={rejectModalAction} variation='base-plain'>No</Button>
      </ModalDialog>
    </ModalWindow>
  );
};

Modal.propTypes = {
  modalMessage: PropTypes.string.isRequired,
  confirmModalAction: PropTypes.func.isRequired,
  rejectModalAction: PropTypes.func.isRequired
};

export default Modal;
