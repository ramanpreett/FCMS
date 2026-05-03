// Config Object
const config = {
  development: {
    API_URL: `{process.env.REACT_APP_API_URL}`,
    ENV: 'development'
  },
  production: {
    API_URL: 'https://fcms-pzhn.onrender.com',
    ENV: 'production'
  }
};

// Environment Detection
const getEnvironment = () => {
  
  if (process.env.NODE_ENV === 'development') {
    return 'development';
  }
  
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'development';
  }
  
  return 'production';
};

const currentEnv = getEnvironment();
const currentConfig = config[currentEnv];

// Use env variable if available, otherwise use auto-detected config
export const API_URL = process.env.REACT_APP_API_URL || currentConfig.API_URL;
export const ENV = process.env.REACT_APP_ENV || currentConfig.ENV;

// Debug logging
console.log('Environment:', ENV);
console.log('API URL:', API_URL);

export default {
  API_URL,
  ENV
};