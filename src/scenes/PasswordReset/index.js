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
  { backgroundImg: '/images/btn_web_process_complete_normal.svg' },
];

const StyledSection = styled.section`
  display: flex;
  flex-flow: column;
  margin: 0;
  min-height: 100%;
`;

const StyledHeader = styled.div`
  padding: 2rem 0;
  margin-bottom: 2rem;
  text-align: center;
  background: #414042;
`;

const StyledLogo = styled.img`
  width: 5rem;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 0 1rem;
  justify-content: space-between;
`;

const StyledButtonGroup = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  margin-bottom: 2.5rem;
`;

class PasswordReset extends Component {
  constructor (props) {
    super(props);
    this.state = {
      new_password: '',
      retype_new_password: '',
      loading: false,
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
          message = intl.formatMessage({ id: `password_reset_${rule.message}` });
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
      const { email = '', lost = '' } = parsed;
      const result = await apis.resetPassword({
        email,
        lost,
        password: this.state.new_password,
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
            message: this.props.intl.formatMessage({ id: 'password_reset_error_request_failure' }),
          },
        });
      }
    } catch (error) {
      this.setState({ loading: false, error });
    }
  }

  backApp = (eventType = 'exit', params) => {
    const stringified = queryString.stringify({
      eventType,
      ...params,
    });
    const url = `sample://event?${stringified}`;
    console.info('back...', url);
    window.location.replace(url);
  }

  render () {
    const { intl } = this.props;
    const { loading, completed, error } = this.state;
    const isCheckPass = this.checkRequiredFields();

    return (
      <StyledSection>
        <StyledHeader>
          <StyledLogo src="/images/ic_web_logo.svg" />
        </StyledHeader>

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
                disabled={loading || !isCheckPass}
                onClick={this.handleSubmit}
              />
            </StyledButtonGroup>
          </div>
        </StyledForm>

        {loading && <Loading />}
        {completed && <CompleteScreen text={intl.formatMessage({ id: 'password_reset_completed' })} />}
        {error && (
          <Dialog
            title={intl.formatMessage({
              id: error.code === 'VALID_FAILURE'
                ? 'password_reset_error_title'
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

PasswordReset.propTypes = {
};

PasswordReset.defaultProps = {
};

export default injectIntl(PasswordReset);
