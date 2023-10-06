import React, { Component } from 'react';
import queryString from 'query-string';
import { injectIntl, FormattedHTMLMessage } from 'react-intl';
import styled from 'styled-components';

import * as apis from '@root/apis/auth';
import InputGroup, { validate } from '@root/components/InputGroup';
import Button from '@root/components/Button';
import Dialog from '@root/components/Dialog';
import Loading from '@root/components/Loading';
import CompleteScreen from '@root/components/CompleteScreen';

const INPUTS = [{
  name: 'serial_number',
  rules: [{
    format: /^SI\d{6}[1-9|A|B|C]\d{4}/,
    message: 'serial_number_invalid',
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

const StyledRow = styled.div`
  display: flex;
  align-content: center;
`;

const StyledCheckRow = styled(StyledRow)`
  margin-top: 2rem;
`;

const StyledCheckLabel = styled.label`
  margin: .1875rem .25rem;
  font-size: .75rem;
  a {
    color: #0f87ff;
    text-decoration: underline;
  }
`;

class DeviceRegistration extends Component {
  constructor (props) {
    super(props);
    this.state = {
      serial_number: '',
      isReadTerms: false,
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

    if (this.state.isReadTerms) {
      return valid;
    }
    return false;
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
          message = intl.formatMessage({ id: `sample_registration_${rule.message}` });
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
      const { token = '' } = parsed;
      const result = await apis.registerDevice({
        token,
        deviceId: this.state.serial_number,
      });
      console.info('result...', result);
      this.setState({ loading: false, completed: true });
      setTimeout(() => {
        this.backApp('done');
      }, 1000);
    } catch (err) {
      const { intl } = this.props;
      let error = err;
      if (err.response.status === 409) {
        error = {
          code: 'ALREADY_EXIST',
          message: intl.formatMessage({ id: 'sample_registration_error_serial_number_exist' }),
        };
      }
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
    const { isReadTerms, loading, completed, lock, showExitConfirm, error } = this.state;
    const isCheckPass = this.checkRequiredFields();

    return (
      <StyledSection>
        <StyledTitleBar>
          <StyledTitle>{intl.formatMessage({ id: 'sample_registration_title' })}</StyledTitle>
        </StyledTitleBar>

        <StyledForm onSubmit={this.handleSubmit}>
          <div>
            {INPUTS.map(item => (
              <InputGroup
                key={item.name}
                name={item.name}
                value={this.state[item.name]}
                label={intl.formatMessage({ id: `sample_registration_${item.name}` })}
                note={intl.formatMessage({ id: `sample_registration_${item.name}_note` })}
                type={item.type}
                placeholder={intl.formatMessage({ id: `sample_registration_${item.name}_placeholder` })}
                autoComplete={item.autoComplete}
                rules={item.rules && item.rules.map(rule => ({
                  ...rule,
                  comparison: rule.validator === 'equal' ? this.state[rule.comparison] : undefined,
                  message: intl.formatMessage({ id: `sample_registration_${rule.message}` }),
                }))}
                required
                onChange={this.handleInputChange(item.name)}
              />
            ))}

            <StyledCheckRow>
              <input
                type="checkbox"
                id="check"
                name="check"
                value={isReadTerms}
                onChange={() => this.setState({ isReadTerms: !isReadTerms })}
              />
              <StyledCheckLabel htmlFor="check">
                <FormattedHTMLMessage id="sample_registration_terms" />
              </StyledCheckLabel>
            </StyledCheckRow>
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
        {completed && <CompleteScreen text={intl.formatMessage({ id: 'sample_registration_completed' })} />}
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
              id: (error.code === 'VALID_FAILURE' || error.code === 'ALREADY_EXIST')
                ? 'sample_registration_error_title'
                : 'confirm_request_failure_title',
            })}
            content={(error.code === 'VALID_FAILURE' || error.code === 'ALREADY_EXIST')
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

DeviceRegistration.propTypes = {
};

DeviceRegistration.defaultProps = {
};

export default injectIntl(DeviceRegistration);
