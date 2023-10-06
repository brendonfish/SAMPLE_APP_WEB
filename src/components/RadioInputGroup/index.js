import React, { Component } from 'react';
import { string, array, func } from 'prop-types';
import styled from 'styled-components';

const StyledInputGroup = styled.div`
  width: 100%;
  margin-bottom: 2rem;
  `;

const StyledInputField = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 3rem;
`;

class RadioInputItem extends Component {
  render () {
    const { name, value, label, list, onChange } = this.props;

    return (
      <StyledInputGroup>
        <label>{label}</label>

        {list.map(item => (
          <StyledInputField key={item.value}>
            <input
              type="radio"
              name={name}
              id={item.value}
              value={item.value}
              checked={item.value === value}
              onChange={onChange}
            />
            <label htmlFor={name}>{item.label}</label>
          </StyledInputField>
        ))}
      </StyledInputGroup>
    );
  }
}

RadioInputItem.propTypes = {
  label: string.isRequired,
  list: array,
  name: string,
  value: string,
  onChange: func,
};

RadioInputItem.defaultProps = {
  name: '',
  value: '',
  list: [],
  onChange: () => {},
};

export default RadioInputItem;
