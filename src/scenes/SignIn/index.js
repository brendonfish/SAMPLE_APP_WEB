import React, { Component } from 'react';
import { object } from 'prop-types';
import queryString from 'query-string';
import { injectIntl } from 'react-intl';
import styled from 'styled-components';

import * as apis from '@root/apis/auth';
import InputGroup, { validate } from '@root/components/InputGroup';
import Button from '@root/components/Button';
import Dialog from '@root/components/Dialog';
import Loading from '@root/components/Loading';
import CompleteScreen from '@root/components/CompleteScreen';

const INPUTS = [{
  name: 'email',
  type: 'email',
  autoComplete: 'email',
  rules: [{
    validator: 'email',
    message: 'email_pattern_invalid',
  }],
}, {
  name: 'password',
  type: 'password',
  autoComplete: 'new-password',
}];

const BUTTONS = [
  { backgroundImg: '/images/btn_web_process_cancel_normal.svg' },
  { backgroundImg: '/images/btn_web_process_next_normal.svg' },
  { backgroundImg: '/images/btn_web_process_complete_normal.svg' },
];

const StyledSection = styled.section`
  display: flex;
  flex-flow: column;
  margin: 0 1rem;
  min-height: 100%;
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
`;

const StyledButtonGroup = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  margin-bottom: 2.5rem;
`;

const StyledForgotPasswordLink = styled.a`
  font-size: .875rem;
  color: #0f87ff;
  text-decoration: underline;
`;

class SignIn extends Component {
  constructor (props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      loading: false,
      completed: false,
      lock: false,
      showExitConfirm: false,
    };
  }

  checkRequiredFields = () => {
    const valid = INPUTS.every(item => {
      return !!this.state[item.name];
    });

    return valid;
  }

  checkValid = () => {
    const { intl } = this.props;
    let message;
    const valid = INPUTS.every(item => {
      if (!item.rules) {
        return true;
      }

      return item.rules.every(rule => {
        let isValid = true;
        if (rule.validator) {
          isValid = validate(this.state[item.name], {
            ...rule,
            comparison: rule.validator === 'equal' ? this.state[rule.comparison] : undefined,
          });
        } else if (rule.format) {
          isValid = rule.format.test(this.state[item.name]);
        }

        if (!isValid) {
          message = intl.formatMessage({ id: `sign_in_${rule.message}` });
        }
        return isValid;
      });
    });

    if (!valid) {
      this.setState({
        error: {
          code: 'VALID_FAILURE',
          message,
        },
      });
    }
    return valid;
  }

  handleToForgotPW = () => {
    this.props.history.push('/lost-password');
  }

  handleInputChange = name => evt => {
    this.setState({ [name]: evt.target.value });
  }

  handleSubmit = async evt => {
    evt.preventDefault();
    const isValid = this.checkValid();
    if (!isValid) {
      return;
    }

    this.setState({ loading: true, error: undefined });
    try {
      const result = await apis.signIn(this.state);
      console.info('result...', result);
      if (result.login) {
        const { identityId, token } = result;
        const { email } = this.state;
        this.setState({ loading: false, completed: true });
        setTimeout(() => {
          this.backApp('done', { user_id: `${email}_innovart`, identityId, token });
        }, 1000);
      } else {
        this.setState({
          loading: false,
          error: {
            code: 'VALID_FAILURE',
            message: this.props.intl.formatMessage({ id: 'sign_in_error_request_failure' }),
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

  render () {
    const { intl } = this.props;
    const { loading, completed, lock, showExitConfirm, error } = this.state;
    const isCheckPass = this.checkRequiredFields();

    return (
      <StyledSection>
        <StyledTitleBar>
          <StyledTitle>{intl.formatMessage({ id: 'sign_in_title' })}</StyledTitle>
        </StyledTitleBar>

        <StyledForm onSubmit={this.handleSubmit}>
          <div>
            {INPUTS.map(item => (
              <InputGroup
                key={item.name}
                name={item.name}
                value={this.state[item.name]}
                label={intl.formatMessage({ id: `sign_in_${item.name}` })}
                type={item.type}
                placeholder={intl.formatMessage({ id: `sign_in_${item.name}_placeholder` })}
                autoComplete={item.autoComplete}
                rules={item.rules && item.rules.map(rule => ({
                  ...rule,
                  comparison: rule.validator === 'equal' ? this.state[rule.comparison] : undefined,
                  message: intl.formatMessage({ id: `sign_in_${rule.message}` }),
                }))}
                required
                onChange={this.handleInputChange(item.name)}
              />
            ))}
            <StyledForgotPasswordLink onClick={this.handleToForgotPW}>
              {intl.formatMessage({ id: 'sign_in_forgot' })}
            </StyledForgotPasswordLink>
          </div>

          <div>
            <StyledButtonGroup>
              <Button
                {...BUTTONS[0]}
                disabled={lock}
                onClick={this.handleExit}
              />
              <Button
                {...BUTTONS[2]}
                disabled={lock || loading || !isCheckPass}
                onClick={this.handleSubmit}
              />
            </StyledButtonGroup>
          </div>
        </StyledForm>

        {loading && <Loading />}
        {completed && <CompleteScreen text={intl.formatMessage({ id: 'sign_in_completed' })} />}
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
                ? 'sign_in_error_title'
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

SignIn.propTypes = {
  history: object,
};

SignIn.defaultProps = {
  history: {},
};

export default injectIntl(SignIn);
