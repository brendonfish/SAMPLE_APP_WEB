import React, { Component } from 'react';
import { string, object, func } from 'prop-types';
import { injectIntl } from 'react-intl';
import styled from 'styled-components';

const StyledMask = styled.div`
  position: fixed;
  display: flex;
  justify-content: center;
  align-content: center;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: #000000b3;
  z-index: 10;
`;
const StyledDialog = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: auto 2rem;
  padding: 24px 24px 16px 24px;
  min-width: 280px;
  min-height: 140px;
  border-radius: 10px;
  background: #f5f6fa;
  color: #2b2b2b;
`;
const StyledTitle = styled.div`
  font-size: 1rem;
`;
const StyledContent = styled.div`
  font-size: .75rem;
`;
const StyledControls = styled.div`
  display: flex;
  justify-content: flex-end;
`;
const StyledControl = styled.div`
  margin-left: 3rem;
  font-size: .875rem;
  course: pointer;
`;
const StyledConfirm = styled(StyledControl)`
  color: #0f87ff;
`;
const StyledCancel = styled(StyledControl)`
  color: #a1a1a2;
`;

class Dialog extends Component {
  handleDialogClick = e => {
    e.stopPropagation();
  }

  render () {
    const {
      intl,
      title,
      content,
      confirmText,
      cancelText,
      onConfirm,
      onCancel,
      onClose,
    } = this.props;

    return (
      <StyledMask onClick={onClose}>
        <StyledDialog onClick={this.handleDialogClick}>
          <StyledTitle>{title}</StyledTitle>
          <StyledContent>{content}</StyledContent>
          <StyledControls>
            {onCancel && (
              <StyledCancel onClick={onCancel}>
                {cancelText || intl.formatMessage({ id: 'confirm_default_cancel' })}
              </StyledCancel>
            )}
            {onConfirm && (
              <StyledConfirm onClick={onConfirm}>
                {confirmText || intl.formatMessage({ id: 'confirm_default_confirm' })}
              </StyledConfirm>
            )}
          </StyledControls>
        </StyledDialog>
      </StyledMask>
    );
  }
}

Dialog.propTypes = {
  intl: object.isRequired,
  cancelText: string,
  confirmText: string,
  content: string,
  title: string,
  onCancel: func,
  onClose: func,
  onConfirm: func,
};

Dialog.defaultProps = {
  title: '',
  content: '',
  confirmText: '',
  cancelText: '',
  onClose: () => {},
  onCancel: undefined,
  onConfirm: undefined,
};

export default injectIntl(Dialog);
