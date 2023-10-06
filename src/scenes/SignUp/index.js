import React, { Component } from 'react';
import queryString from 'query-string';
import { injectIntl } from 'react-intl';
import styled from 'styled-components';

import * as apis from '@root/apis/auth';
import InputGroup, { validate } from '@root/components/InputGroup';
import RadioInputGroup from '@root/components/RadioInputGroup';
import Button from '@root/components/Button';
import Dialog from '@root/components/Dialog';
import Loading from '@root/components/Loading';
import CompleteScreen from '@root/components/CompleteScreen';

const INPUTS = [
  [{
    name: 'email',
    type: 'email',
    autoComplete: 'email',
    rules: [{
      validator: 'email',
      message: 'email_pattern_invalid',
    }],
    immediatelyValid: true,
  }, {
    name: 'password',
    type: 'password',
    autoComplete: 'new-password',
    rules: [{
      validator: 'password',
      message: 'password_pattern_invalid',
    }],
    immediatelyValid: true,
  }, {
    name: 'retype_password',
    type: 'password',
    autoComplete: 'new-password',
    rules: [{
      validator: 'equal',
      comparison: 'password',
      message: 'retype_password_not_match',
    }],
    immediatelyValid: true,
  }],
];

const BUTTONS = [
  { backgroundImg: '/images/btn_web_process_cancel_normal.svg' },
  { backgroundImg: '/images/btn_web_process_previous_normal.svg' },
  { backgroundImg: '/images/btn_web_process_next_normal.svg' },
  { backgroundImg: '/images/btn_web_process_complete_normal.svg' },
];

const StyledSection = styled.section`
  display: flex;
  flex-flow: column;
  margin: 0 1rem;
  height: 100%;
`;

const StyledTitleBar = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 1rem;
  margin-bottom: 1.5rem;
  color: #008687;
`;

const StyledTitle = styled.h1`
  font-size: 1.5rem;
  line-height: 2rem;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: space-between;
  overflow: hidden;
`;

const StyledButtonGroup = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  margin-bottom: 2.5rem;
`;

const StyledStepContainer = styled.div`
  overflow-y: scroll;
`;

class SignUp extends Component {
  constructor (props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      loading: false,
      completed: false,
      lock: false,
      step: 0,
      showExitConfirm: false,
    };
  }

  checkValid = () => {
    const { step } = this.state;
    const valid = INPUTS[step].every(item => {
      if (item.rules) {
        return item.rules.every(rule => validate(this.state[item.name], {
          ...rule,
          comparison: rule.validator === 'equal' ? this.state[rule.comparison] : undefined,
        }));
      } else {
        return !!this.state[item.name];
      }
    });

    return valid;
  }

  handleInputChange = name => evt => {
    this.setState({ [name]: evt.target.value });
  }

  handlePrev = () => {
    this.setState(({ step }) => ({ step: step - 1 }));
  }

  handleSubmit = async evt => {
    evt.preventDefault();
    this.setState({ loading: true, error: undefined });
    try {
      const result = await apis.signUp(this.state);
      console.info('result...', result);
      if (result.created) {
        const { identityId, token } = result;
        this.setState({ loading: false, completed: true });
        setTimeout(() => {
          this.props.history.push({
            pathname: '/edit-profile',
            state: {
              identityId: identityId,
              token: token,
              email: this.state.email,
            },
          });
        }, 1000);
      } else {
        this.setState({
          loading: false,
          error: {
            code: 'VALID_FAILURE',
            message: this.props.intl.formatMessage({ id: 'sign_up_error_email_exist' }),
          },
        });
      }
    } catch (error) {
      this.setState({ loading: false, error });
    }
  }

  handleExit = () => {
    this.setState({ showExitConfirm: true });
  }

  backApp = (eventType = 'exit', params) => {
    const stringified = queryString.stringify({
      eventType,
      ...params,
    });
    const url = `sample://event?${stringified}`;
    console.info('back...', url);
    this.setState({ lock: true, showExitConfirm: false });
    window.location.replace(url);
  }

  renderInput = item => {
    const { intl } = this.props;
    const Component = item.type === 'radio' ? RadioInputGroup : InputGroup;
    let restProps;
    if (item.type === 'radio') {
      restProps = {
        list: item.list.map(values => ({
          ...values,
          label: intl.formatMessage({ id: `sign_up_${values.label}` }),
        })),
      };
    } else {
      restProps = {
        type: item.type,
        placeholder: intl.formatMessage({ id: `sign_up_${item.name}_placeholder` }),
        autoComplete: item.autoComplete,
        rules: item.rules && item.rules.map(rule => ({
          ...rule,
          comparison: rule.validator === 'equal' ? this.state[rule.comparison] : undefined,
          message: intl.formatMessage({ id: `sign_up_${rule.message}` }),
        })),
        immediatelyValid: item.immediatelyValid,
      };
    }

    return (
      <Component
        key={item.name}
        name={item.name}
        value={this.state[item.name]}
        label={intl.formatMessage({ id: `sign_up_${item.name}` })}
        required
        onChange={this.handleInputChange(item.name)}
        {...restProps}
      />
    );
  }

  renderStep () {
    const { step } = this.state;
    return (
      <StyledStepContainer>
        {INPUTS[step].map(name => (
          this.renderInput(name)
        ))}
      </StyledStepContainer>
    );
  }

  render () {
    const { intl } = this.props;
    const { loading, completed, lock, showExitConfirm, error } = this.state;
    const isValid = this.checkValid();

    return (
      <StyledSection>
        <StyledTitleBar>
          <StyledTitle>{intl.formatMessage({ id: 'sign_up_title' })}</StyledTitle>
        </StyledTitleBar>

        <StyledForm>
          {this.renderStep()}

          <div>
            <StyledButtonGroup>
              <Button
                {...BUTTONS[0]}
                disabled={lock}
                onClick={this.handleExit}
              />
              <Button
                {...BUTTONS[2]}
                disabled={lock || loading || !isValid}
                onClick={this.handleSubmit}
              />
            </StyledButtonGroup>
          </div>
        </StyledForm>

        {loading && <Loading />}
        {completed && <CompleteScreen text={intl.formatMessage({ id: 'sign_up_completed' })} />}
        {showExitConfirm && (
          <Dialog
            title={intl.formatMessage({ id: 'confirm_exit_title' })}
            confirmText={intl.formatMessage({ id: 'confirm_exit_confirm' })}
            cancelText={intl.formatMessage({ id: 'confirm_exit_cancel' })}
            onConfirm={() => this.setState({ showExitConfirm: false })}
            onCancel={() => this.backApp()}
            onClose={() => this.setState({ showExitConfirm: false })}
          />
        )}
        {error && (
          <Dialog
            title={intl.formatMessage({
              id: error.code === 'VALID_FAILURE'
                ? 'sign_up_error_title'
                : 'confirm_request_failure_title',
            })}
            content={error.code === 'VALID_FAILURE'
              ? error.message
              : intl.formatMessage({
                id: error.code === 'ECONNABORTED'
                  ? 'confirm_request_timeout_content'
                  : 'confirm_request_server_error_content',
              })}
            onClose={() => this.setState({ error: false })}
            onConfirm={() => this.setState({ error: false })}
          />
        )}

      </StyledSection>
    );
  }
}

SignUp.propTypes = {
};

SignUp.defaultProps = {
};

export default injectIntl(SignUp);
