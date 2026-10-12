import { io } from 'socket.io-client';

const socketUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : (typeof window !== 'undefined' ? window.location.origin : '');

export const socket = io(socketUrl, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

export async function api(endpoint, options = {}) {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('gym_token') : null;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let body = options.body;
  if (body && typeof body === 'object') {
    body = JSON.stringify(body);
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
    body
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = { error: `Server returned ${res.status}` };
  }

  if (!res.ok) {
    const errorMsg = data.error || `HTTP error ${res.status}`;
    const err = new Error(errorMsg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export async function apiRequest(path, method = 'GET', body = null, token = null) {
  const options = { method };
  if (body) options.body = body;
  if (token) options.headers = { Authorization: `Bearer ${token}` };
  return api(path, options);
}
