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

const STEP_COUNT = 4;

const INPUTS = [
  [{
    name: 'nickname',
  }],
  [{
    name: 'gender',
    type: 'radio',
    list: [
      { label: 'gender_male', value: 'Male' },
      { label: 'gender_female', value: 'Female' },
      { label: 'gender_other', value: 'Intersex' },
      { label: 'no_answer', value: 'N/A' },
    ],
  }],
  [{
    name: 'age',
    type: 'radio',
    list: [
      { label: 'age_0', value: 'Age 20 and below' },
      { label: 'age_1', value: 'Age 21-30' },
      { label: 'age_2', value: 'Age 31-40' },
      { label: 'age_3', value: 'Age 41-50' },
      { label: 'age_4', value: 'Age 51-60' },
      { label: 'age_5', value: 'Age 61 and above' },
      { label: 'no_answer', value: 'N/A' },
    ],
  }],
  [{
    name: 'car',
    type: 'radio',
    list: [
      { label: 'car_0', value: 'user_profile_cartype_compact' },
      { label: 'car_1', value: 'user_profile_cartype_sedan' },
      { label: 'car_2', value: 'user_profile_cartype_5door' },
      { label: 'car_3', value: 'user_profile_cartype_suv' },
      { label: 'car_4', value: 'user_profile_cartype_minivan' },
      { label: 'car_5', value: 'user_profile_cartype_sports' },
      { label: 'car_6', value: 'user_profile_cartype_pickup' },
      { label: 'car_7', value: 'user_profile_cartype_hybrid' },
      { label: 'car_8', value: 'user_profile_cartype_electric' },
      { label: 'car_9', value: 'user_profile_cartype_other' },
      { label: 'no_answer', value: 'user_profile_cartype_refuse' },
    ],
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

const StyledProcess = styled.p`
  position: relative;
  bottom: 0.5rem;
  font-size: 0.75rem;
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

class EditProfile extends Component {
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
    if (this.state.step < STEP_COUNT - 1) {
      this.setState({
        step: this.state.step + 1,
      });
    } else {
      this.setState({ loading: true, error: undefined });
      const { state = {}, search = '' } = this.props.location;
      const queries = queryString.parse(search);
      try {
        let email = state.email || queries.email;
        let token = state.token || queries.token;
        const result = await apis.updateProfile({
          ...this.state,
          email,
          token,
        });
        console.info('result...', result);
        this.setState({ loading: false, completed: true });
        setTimeout(() => {
          if (state.identityId) {
            this.backApp('done', { user_id: `${email}_innovart`, identityId: state.identityId, token });
          } else {
            this.backApp('done');
          }
        }, 1000);
      } catch (error) {
        this.setState({ loading: false, error });
      }
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
          label: intl.formatMessage({ id: `edit_profile_${values.label}` }),
        })),
      };
    } else {
      restProps = {
        type: item.type,
        placeholder: intl.formatMessage({ id: `edit_profile_${item.name}_placeholder` }),
        autoComplete: item.autoComplete,
        rules: item.rules && item.rules.map(rule => ({
          ...rule,
          comparison: rule.validator === 'equal' ? this.state[rule.comparison] : undefined,
          message: intl.formatMessage({ id: `edit_profile_${rule.message}` }),
        })),
        immediatelyValid: item.immediatelyValid,
      };
    }

    return (
      <Component
        key={item.name}
        name={item.name}
        value={this.state[item.name]}
        label={intl.formatMessage({ id: `edit_profile_${item.name}` })}
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
    const { step, loading, completed, lock, showExitConfirm, error } = this.state;
    const isLastStep = step + 1 === STEP_COUNT;
    const isValid = this.checkValid();

    return (
      <StyledSection>
        <StyledTitleBar>
          <StyledTitle>{intl.formatMessage({ id: 'edit_profile_title' })}</StyledTitle>
          <StyledProcess>{`${step + 1} / ${STEP_COUNT}`}</StyledProcess>
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
              {step > 1 && (
                <Button
                  {...BUTTONS[1]}
                  disabled={lock || loading}
                  onClick={this.handlePrev}
                />
              )}
              <Button
                {...BUTTONS[!isLastStep ? 2 : 3]}
                disabled={lock || loading || !isValid}
                onClick={this.handleSubmit}
              />
            </StyledButtonGroup>
          </div>
        </StyledForm>

        {loading && <Loading />}
        {completed && <CompleteScreen text={intl.formatMessage({ id: 'edit_profile_completed' })} />}
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
                ? 'edit_profile_error_title'
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

EditProfile.propTypes = {
};

EditProfile.defaultProps = {
};

export default injectIntl(EditProfile);
