export class HttpError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.body = body;
  }
}

export async function fetchJson(url, options = {}) {
  const headers = {
    Accept: 'application/json',
    ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
    body: options.body !== undefined && typeof options.body !== 'string'
      ? JSON.stringify(options.body)
      : options.body,
  });

  const text = await response.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); }
    catch { data = text; }
  }

  if (!response.ok) {
    const message = typeof data === 'object' && data?.error
      ? String(data.error)
      : `${response.status} ${response.statusText}`;
    throw new HttpError(message, response.status, data);
  }
  return data;
}

export class PasswordSessionClient {
  constructor({ baseUrl, username, password, loginPath = '/api/auth/login' }) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.username = username;
    this.password = password;
    this.loginPath = loginPath;
    this.token = null;
  }

  async login() {
    if (!this.username || !this.password) {
      throw new Error(`Credentials are not configured for ${this.baseUrl}`);
    }
    const data = await fetchJson(this.baseUrl + this.loginPath, {
      method: 'POST',
      body: { username: this.username, password: this.password },
    });
    if (!data?.token) throw new Error(`Login response from ${this.baseUrl} did not include a token`);
    this.token = data.token;
    return this.token;
  }

  async request(path, options = {}, retry = true) {
    const hasCredentials = !!(this.username && this.password);
    if (hasCredentials && !this.token) await this.login();
    try {
      return await fetchJson(this.baseUrl + path, {
        ...options,
        headers: {
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
          ...(options.headers || {}),
        },
      });
    } catch (error) {
      if (retry && hasCredentials && error instanceof HttpError && error.status === 401) {
        this.token = null;
        await this.login();
        return this.request(path, options, false);
      }
      throw error;
    }
  }
}
