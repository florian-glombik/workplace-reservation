const SERVER_BASE_URL = process.env.REACT_APP_SERVER_URL ?? 'http://172.17.0.1:8080'

export function composeServerUrl(path: string) {
  if (!isValidUrl(SERVER_BASE_URL)) {
    console.error("The Server URL is not a valid url: " + SERVER_BASE_URL)
  }

  return SERVER_BASE_URL + (path.startsWith('/') ? path : `/${path}`)
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}