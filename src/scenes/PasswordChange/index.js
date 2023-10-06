import React, { Component } from 'react';
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
  name: 'current_password',
  type: 'password',
  autoComplete: 'new-password',
}, {
  name: 'new_password',
  type: 'password',
  autoComplete: 'new-password',
  rules: [{
    validator: 'password',
    message: 'password_pattern_invalid',
  }],
}, {
  name: 'retype_new_password',
  type: 'password',
  autoComplete: 'new-password',
  rules: [{
    validator: 'equal',
    comparison: 'new_password',
    message: 'retype_password_not_match',
  }],
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

class PasswordChange extends Component {
  constructor (props) {
    super(props);
    this.state = {
      current_password: '',
      new_password: '',
      retype_new_password: '',
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
          message = intl.formatMessage({ id: `password_change_${rule.message}` });
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
      const parsed = queryString.parse(window.location.search);
      const { user_id: userId = '' } = parsed;
      const email = userId.replace(/(^.*)_innovart$/, '$1');
      const result = await apis.changePassword({
        email,
        oldPassword: this.state.current_password,
        newPassword: this.state.new_password,
      });
      console.info('result...', result);
      if (result.changed) {
        this.setState({ loading: false, completed: true });
        setTimeout(() => {
          this.backApp('done');
        }, 1000);
      } else {
        this.setState({
          loading: false,
          error: {
            code: 'VALID_FAILURE',
            message: this.props.intl.formatMessage({ id: 'password_change_error_request_failure' }),
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
          <StyledTitle>{intl.formatMessage({ id: 'password_change_title' })}</StyledTitle>
        </StyledTitleBar>

        <StyledForm onSubmit={this.handleSubmit}>
          <div>
            {INPUTS.map(item => (
              <InputGroup
                key={item.name}
                name={item.name}
                value={this.state[item.name]}
                label={intl.formatMessage({ id: `password_change_${item.name}` })}
                type={item.type}
                placeholder={intl.formatMessage({ id: `password_change_${item.name}_placeholder` })}
                autoComplete={item.autoComplete}
                rules={item.rules && item.rules.map(rule => ({
                  ...rule,
                  comparison: rule.validator === 'equal' ? this.state[rule.comparison] : undefined,
                  message: intl.formatMessage({ id: `password_change_${rule.message}` }),
                }))}
                required
                onChange={this.handleInputChange(item.name)}
              />
            ))}
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
        {completed && <CompleteScreen text={intl.formatMessage({ id: 'password_change_completed' })} />}
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
                ? 'password_change_error_title'
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

PasswordChange.propTypes = {
};

PasswordChange.defaultProps = {
};

export default injectIntl(PasswordChange);
