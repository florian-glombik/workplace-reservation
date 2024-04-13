const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_URL ?? 'http://172.17.0.1:8080'

export function composeBackendUrl(path: string) {
  if (!BACKEND_BASE_URL) {
    console.warn('No server URL is set. Using default value.')
  }
  return BACKEND_BASE_URL + (path.startsWith('/') ? path : `/${path}`)
}
