import React, { Component } from 'react';
import styled, { keyframes } from 'styled-components';

const loadingKeyframes = keyframes`
  0%   {
    transform: scale(0.5);
  }
  50%   {
    transform: scale(1);
  }
  100% {
    transform: scale(0.5);
  }
`;

const StyledContainer = styled.div`
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: #000000b3;
`;
const StyledLoading = styled.ul`
  display: flex;
  justify-content: space-between;
  margin-left: auto;
  margin-right: auto;
  width: 5rem;
  font-size: 0;
  list-style: none;
  li {
    width: 20px;
    height: 20px;
    border-radius: 100%;
    background: white;
    transform: transformZ(0);
    animation: ${loadingKeyframes} 1.5s infinite;
    &:nth-child(1n) {
      animation-delay: 0s;
    }
    &:nth-child(2n) {
      animation-delay: 0.2s;
    }
    &:nth-child(3n) {
      animation-delay: 0.4s;
    }
  }
`;

class Loading extends Component {
  render () {
    return (
      <StyledContainer>
        <StyledLoading>
          <li />
          <li />
          <li />
        </StyledLoading>
      </StyledContainer>
    );
  }
}

Loading.propTypes = {
};

Loading.defaultProps = {
};

export default Loading;
