export function getCsrfTokenFromCookie() {
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith("csrf_token="));

  if (!cookie) return null;
  return decodeURIComponent(cookie.split("=")[1] || "");
}
