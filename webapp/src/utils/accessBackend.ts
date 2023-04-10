const BACKEND_BASE_URL = 'workplace-reservation-backend.florian-glombik.de'
// process.env.REACT_APP_BACKEND_URL ?? 'http://172.17.0.1:8080'
// TODO fix environment variable

export function composeBackendUrl(path: string) {
  return BACKEND_BASE_URL + (path.startsWith('/') ? path : `/${path}`)
}
