const CSRF_STORAGE_KEY = "csrf_token";

export function getCsrfTokenFromCookie() {
  return window.localStorage.getItem(CSRF_STORAGE_KEY);
}

export function setCsrfToken(token) {
  if (!token) return;
  window.localStorage.setItem(CSRF_STORAGE_KEY, token);
}

export function clearCsrfToken() {
  window.localStorage.removeItem(CSRF_STORAGE_KEY);
}
