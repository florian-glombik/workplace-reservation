// const BACKEND_DOMAIN = process.env.REACT_APP_BACKEND_URL ?? 'http://localhost'
const BACKEND_BASE_URL = "http://localhost:8080/"

export function composeBackendUrl(path: string) {
    return BACKEND_BASE_URL + (path.startsWith("/") ? path : `/${path}`)
}