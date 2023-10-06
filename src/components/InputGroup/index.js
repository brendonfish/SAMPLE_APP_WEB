import React, { Component } from 'react';
import { string, bool, array, func } from 'prop-types';
import styled from 'styled-components';

const StyledInputGroup = styled.div`
  position: relative;
  width: 100%;
  min-height: 6.25rem;
  display: flex;
  flex-direction: column;
  :after {
    content: "";
    position: absolute;
    right: .3rem;
    top: 2.3rem;
    width: 1rem;
    height: 1rem;
    background-image: ${({ immediatelyValid, isValid, value }) => immediatelyValid && value
    ? isValid
      ? 'url(/images/ic_web_input_valid_normal.svg)'
      : 'url(/images/ic_web_input_invalid_normal.svg)'
    : 'none'};
    background-repeat: no-repeat;
    background-position: 50% 50%;
  }
`;

const StyledInput = styled.input`
  margin-top: 1rem;
  padding-right: 2.5rem;
  padding-bottom: .5rem;
  color: #2b2b2b;
  font-size: .875rem;
  border: 0;
  border-bottom: 1px solid #a1a1a2;
  background: transparent;
  border-radius: 0;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  :focus {
    border-color: ${({ isValid }) => isValid ? '#0f87ff' : '#fa745b'};
  }
  ::placeholder {
    color: #a1a1a2;
  }
`;

const StyledNote = styled.span`
  margin-top: .5rem;
  font-size: .75rem;
`;

const StyledInvalidMessage = styled.span`
  margin-top: .25rem;
  font-size: .75rem;
  color: #fa745b;
`;

export const validate = (value, rule) => {
  if (!value) return false;
  switch (rule.validator) {
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    case 'password':
      return value.length >= 8 && /^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/.test(value);
    case 'equal':
      return value === rule.comparison;
  }
};

class InputGroup extends Component {
  render () {
    const {
      name,
      value,
      label,
      note,
      type,
      placeholder,
      autoComplete,
      rules,
      required,
      immediatelyValid,
      onChange,
    } = this.props;
    let invalidMessage;
    let isValid = true;
    if (immediatelyValid && value && rules) {
      isValid = rules.every(rule => {
        const valid = validate(value, rule);
        if (!valid) {
          invalidMessage = rule.message;
        }
        return valid;
      });
    }

    return (
      <StyledInputGroup
        isValid={isValid}
        value={value}
        immediatelyValid={immediatelyValid}
      >
        <label>{label}</label>
        <StyledInput
          name={name}
          value={value}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          onChange={onChange}
          isValid={isValid}
        />
        <StyledNote>{note}</StyledNote>
        {!isValid && <StyledInvalidMessage>{invalidMessage}</StyledInvalidMessage>}
      </StyledInputGroup>
    );
  }
}

InputGroup.propTypes = {
  label: string.isRequired,
  autoComplete: string,
  immediatelyValid: bool,
  name: string,
  note: string,
  placeholder: string,
  required: bool,
  rules: array,
  type: string,
  value: string,
  onChange: func,
};

InputGroup.defaultProps = {
  name: '',
  value: '',
  placeholder: '',
  note: undefined,
  autoComplete: 'off',
  required: false,
  type: 'text',
  rules: undefined,
  immediatelyValid: false,
  onChange: () => {},
};

export default InputGroup;
