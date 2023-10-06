import axios from 'axios';

const service = axios.create({
  timeout: 15000,
  headers: {
    'content-type': 'application/json;charset=UTF-8',
    'x-amz-docs-region': 'us-east-1',
  },
});

service.interceptors.response.use(
  ({ data }) => {
    if (data.errorMessage) {
      return Promise.reject(new Error(data.errorMessage));
    }
    return Promise.resolve(data);
  },
  error => Promise.reject(error)
);

const request = config => service(config);

export default request;
