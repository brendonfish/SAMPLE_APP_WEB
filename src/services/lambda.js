import AWS from 'aws-sdk';

AWS.config.region = 'us-west-2';
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: 'us-west-2:xxxxxxxxxxxxxxxxxxx',
});

const singleton = new AWS.Lambda();

const request = payload => new Promise((resolve, reject) => {
  singleton.invoke({
    FunctionName: payload.functionName,
    Payload: JSON.stringify(payload.data),
  }, (err, data) => {
    if (err) {
      return reject(err);
    }

    try {
      const res = JSON.parse(data.Payload);

      if (res.errorMessage) {
        return reject(new Error(res.errorMessage));
      }
      return resolve(res);
    } catch (e) {
      return resolve({});
    }
  });
});

export default request;
