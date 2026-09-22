const env = process.env;

function required(name, value) {
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const config = {
  port: Number(env.PORT || 8080),
  timezone: env.APP_TIMEZONE || 'Asia/Taipei',
  balanceGoal: Number(env.BALANCE_GOAL || 1949),
  sure: {
    baseUrl: (env.SURE_BASE_URL || 'http://sure-web:3000').replace(/\/$/, ''),
    apiKey: env.SURE_API_KEY || '',
    defaultAccountId: env.SURE_DEFAULT_ACCOUNT_ID || '',
  },
  nutritrace: {
    baseUrl: (env.NUTRITRACE_BASE_URL || 'http://nutritrace:3001').replace(/\/$/, ''),
    username: env.NUTRITRACE_USERNAME || 'localadmin',
    password: env.NUTRITRACE_PASSWORD || '',
  },
  lifttrace: {
    baseUrl: (env.LIFTTRACE_BASE_URL || 'http://lifttrace:3003').replace(/\/$/, ''),
    username: env.LIFTTRACE_USERNAME || 'localadmin',
    password: env.LIFTTRACE_PASSWORD || '',
  },
};

export function assertSureConfig() {
  required('SURE_API_KEY', config.sure.apiKey);
  required('SURE_DEFAULT_ACCOUNT_ID', config.sure.defaultAccountId);
}

export function assertNutriTraceConfig() {
  required('NUTRITRACE_USERNAME', config.nutritrace.username);
  required('NUTRITRACE_PASSWORD', config.nutritrace.password);
}

export function assertLiftTraceConfig() {
  required('LIFTTRACE_USERNAME', config.lifttrace.username);
  required('LIFTTRACE_PASSWORD', config.lifttrace.password);
}
