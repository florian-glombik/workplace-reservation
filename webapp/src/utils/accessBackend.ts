const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_URL ?? 'http://172.17.0.1:8080'

export function composeBackendUrl(path: string) {
  if (!isValidUrl(BACKEND_BASE_URL)) {
    console.error("The Server URL is not a valid url: " + BACKEND_BASE_URL)
  }

  return BACKEND_BASE_URL + (path.startsWith('/') ? path : `/${path}`)
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}