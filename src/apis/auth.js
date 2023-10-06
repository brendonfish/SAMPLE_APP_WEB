import lambdaRequest from '@root/services/lambda';
import httpRequest from '@root/services/httpClient';

export const registerDevice = payload => httpRequest({
  url: `https://api.xxx.xxx.com/v1/device/warranty`,
  method: 'POST',
  data: {
    user_token: payload.token,
    device_id: payload.deviceId,
    register_time: `${Math.floor(new Date().getTime() / 1000)}`,
  },
});

export const signUp = payload => lambdaRequest({
  functionName: 'createUser',
  data: {
    email: payload.email,
    password: payload.password,
  },
});

export const signIn = payload => lambdaRequest({
  functionName: 'login',
  data: {
    email: payload.email,
    password: payload.password,
  },
});

export const forgotPassword = payload => lambdaRequest({
  functionName: 'lostPassword',
  data: {
    email: payload.email,
  },
});

export const changePassword = payload => lambdaRequest({
  functionName: 'changePassword',
  data: {
    email: payload.email,
    oldPassword: payload.oldPassword,
    newPassword: payload.newPassword,
  },
});

export const resetPassword = payload => lambdaRequest({
  functionName: 'resetPassword',
  data: {
    email: payload.email,
    lost: payload.lost,
    password: payload.password,
  },
});

export const updateProfile = payload => httpRequest({
  url: 'https://api.xxx.xxx.com/v1/user/profile',
  method: 'POST',
  data: {
    user_id: `${payload.email}`,
    user_token: payload.token,
    nickname: payload.nickname,
    gender: payload.gender,
    age_group: payload.age,
    car_type: payload.car,
  },
});
