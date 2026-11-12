

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const API_URL = (configuredApiUrl || (import.meta.env.DEV ? 'http://localhost:8800' : '')).replace(/\/+$/, '');
const API_VERSION = '/api/v1';

function getRequestErrorMessage(status) {
  if (status === 400) return 'Please check the information you entered and try again.';
  if (status === 401) return 'We could not verify your sign-in. Please sign in again.';
  if (status === 403) return 'You do not have permission to do that.';
  if (status === 404) return 'We could not find what you were looking for.';
  if (status === 409) return 'This request conflicts with existing information. Please review and try again.';
  if (status === 429) return 'Too many requests. Please wait a moment and try again.';
  if (status >= 500) return 'Something went wrong on our end. Please try again shortly.';
  return 'We could not complete your request. Please try again.';
}

async function request(path, { method = 'GET', body, headers = {}, auth = true } = {}) {
  if (!API_URL) {
    throw new Error('The service is temporarily unavailable. Please try again later.');
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const options = {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(auth && token ? { Authorization: 'Bearer ' + token } : {}),
      ...headers,
    },
  };
//METHOD + URL + HEADERS + BODY
  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${API_URL}${API_VERSION}${path}`, options);
  } catch {
    throw new Error('Unable to connect right now. Please check your connection and try again.');
  }

  if (!response.ok) {
    throw new Error(getRequestErrorMessage(response.status));
  }

  try {
    return await response.json();
  } catch {
    throw new Error('We could not process the response. Please try again.');
  }
}

export const api = { request };
