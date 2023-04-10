// const BACKEND_DOMAIN = process.env.REACT_APP_BACKEND_URL ?? 'http://localhost'
const BACKEND_BASE_URL = 'http://172.17.0.1:8080'

export function composeBackendUrl(path: string) {
  return BACKEND_BASE_URL + (path.startsWith('/') ? path : `/${path}`)
}
