import React, { Component } from 'react';
import { string } from 'prop-types';
import styled from 'styled-components';

const StyledContainer = styled.div`
  position: fixed;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: #000000b3;
`;
const StyledText = styled.span`
  margin-top: 1rem;
  font-size: 1.5rem;
  color: #fff;
`;

class Loading extends Component {
  render () {
    return (
      <StyledContainer>
        <img src="/images/ic_web_loading_success.svg" />
        <StyledText>{this.props.text}</StyledText>
      </StyledContainer>
    );
  }
}

Loading.propTypes = {
  text: string,
};

Loading.defaultProps = {
  text: '',
};

export default Loading;
