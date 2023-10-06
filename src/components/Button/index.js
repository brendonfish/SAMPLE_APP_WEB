import React, { Component } from 'react';
import { string, bool, func, any } from 'prop-types';
import styled from 'styled-components';

const StyledButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 30%;
  height: 2.5rem;
  border: 0;
  border-radius: 1.5rem;
  font-size: 1.25rem;
  color: white;
  background: ${({ disabled }) => disabled ? '#a1a1a2' : '#0f87ff'};
  cursor: pointer;
`;

class Button extends Component {
  render () {
    const { backgroundImg, type, disabled, children, onClick } = this.props;

    return (
      <StyledButton disabled={disabled} type={type} onClick={onClick}>
        {backgroundImg && <img src={backgroundImg} />}
        {children}
      </StyledButton>
    );
  }
}

Button.propTypes = {
  backgroundImg: string,
  children: any,
  disabled: bool,
  type: string,
  onClick: func,
};

Button.defaultProps = {
  backgroundImg: '',
  disabled: false,
  type: 'button',
  children: null,
  onClick: () => {},
};

export default Button;
