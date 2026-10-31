export const STORAGE_KEYS = {
  sessionToken: 'fma_session_token',
  user: 'fma_user',
};

export function getSessionToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.sessionToken);
}

export function setSessionToken(token) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(STORAGE_KEYS.sessionToken, token);
  } else {
    localStorage.removeItem(STORAGE_KEYS.sessionToken);
  }
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.user);
  }
}

export async function apiRequest(path, options = {}) {
  const token = getSessionToken();
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData)) {
    headers.set('content-type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    throw new Error(payload?.error || `Request failed: ${response.status}`);
  }

  return payload;
}

export async function loginUser(email, password) {
  const result = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (result.sessionToken) {
    setSessionToken(result.sessionToken);
  }

  if (result.user) {
    setStoredUser(result.user);
  }

  return result;
}

export async function signupUser({ email, fullName, password }) {
  const result = await apiRequest('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, fullName, password }),
  });

  if (result.sessionToken) {
    setSessionToken(result.sessionToken);
  }

  if (result.user) {
    setStoredUser(result.user);
  }

  return result;
}

export async function fetchCurrentUser() {
  const result = await apiRequest('/api/user/me', { method: 'GET' });
  setStoredUser(result.user);
  return result.user;
}

export async function refreshSessionUser() {
  try {
    return await fetchCurrentUser();
  } catch {
    setSessionToken(null);
    setStoredUser(null);
    return null;
  }
}

export function isPremiumUser(user = getStoredUser()) {
  if (!user) return false;
  if (typeof user.isPremium === 'boolean') return user.isPremium;
  return Boolean(user.is_premium || user.planSlug === 'forensic_explorer' || user.planSlug === 'advocate' || user.planSlug === 'investigator');
}

export function requirePremium(user = getStoredUser()) {
  if (!isPremiumUser(user)) {
    throw new Error('Premium plan required');
  }
  return true;
}

export async function verifyAndActivatePurchase({ provider, payload }) {
  const result = await apiRequest('/api/payments/verify', {
    method: 'POST',
    body: JSON.stringify({ provider, payload }),
  });

  await refreshSessionUser();
  return result;
}

export async function createCase({ title, summary, metadata }) {
  return apiRequest('/api/cases', {
    method: 'POST',
    body: JSON.stringify({ title, summary, metadata }),
  });
}

export async function getCases() {
  return apiRequest('/api/cases', { method: 'GET' });
}

export async function createThread({ title, caseId }) {
  return apiRequest('/api/chat/threads', {
    method: 'POST',
    body: JSON.stringify({ title, caseId }),
  });
}

export async function sendThreadMessage(threadId, content) {
  return apiRequest(`/api/chat/threads/${threadId}`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}
