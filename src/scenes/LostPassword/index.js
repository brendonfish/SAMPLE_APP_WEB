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
  name: 'email',
  type: 'email',
  autoComplete: 'email',
  rules: [{
    validator: 'email',
    message: 'email_pattern_invalid',
  }],
}];

const BUTTONS = [
  { backgroundImg: '/images/btn_web_process_cancel_normal.svg' },
  { backgroundImg: '/images/btn_web_process_send_normal.svg' },
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

class LostPassword extends Component {
  constructor (props) {
    super(props);
    this.state = {
      email: '',
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
          message = intl.formatMessage({ id: `lost_password_${rule.message}` });
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
      const result = await apis.forgotPassword(this.state);
      console.info('result...', result);
      if (result.sent) {
        this.setState({ loading: false, completed: true });
        setTimeout(() => {
          this.props.history.push('/sign-in');
        }, 1000);
      } else {
        this.setState({
          loading: false,
          error: {
            code: 'VALID_FAILURE',
            message: this.props.intl.formatMessage({ id: 'lost_password_error_request_failure' }),
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
          <StyledTitle>{intl.formatMessage({ id: 'lost_password_title' })}</StyledTitle>
        </StyledTitleBar>

        <StyledForm>
          {INPUTS.map(item => (
            <InputGroup
              key={item.name}
              name={item.name}
              value={this.state[item.name]}
              label={intl.formatMessage({ id: `lost_password_${item.name}` })}
              type={item.type}
              placeholder={intl.formatMessage({ id: `lost_password_${item.name}_placeholder` })}
              autoComplete={item.autoComplete}
              rules={item.rules && item.rules.map(rule => ({
                ...rule,
                comparison: rule.validator === 'equal' ? this.state[rule.comparison] : undefined,
                message: intl.formatMessage({ id: `lost_password_${rule.message}` }),
              }))}
              required
              onChange={this.handleInputChange(item.name)}
            />
          ))}

          <div>
            <StyledButtonGroup>
              <Button
                {...BUTTONS[0]}
                disabled={lock}
                onClick={this.handleExit}
              />
              <Button
                {...BUTTONS[1]}
                disabled={lock || loading || !isCheckPass}
                onClick={this.handleSubmit}
              />
            </StyledButtonGroup>
          </div>
        </StyledForm>

        {loading && <Loading />}
        {completed && <CompleteScreen text={intl.formatMessage({ id: 'lost_password_completed' })} />}
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
                ? 'lost_password_error_title'
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

LostPassword.propTypes = {
};

LostPassword.defaultProps = {
};

export default injectIntl(LostPassword);
