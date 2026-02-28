export const KC_BASE_INTERNAL = 'http://keycloak:8080'
export const KC_BASE_EXTERNAL = 'http://localhost:8080'
export const KC_REALM = 'sample_realm'
export const CLIENT_ID = 'sample-client'
export const CLIENT_SECRET = 'sample-secret-****************'
export const REDIRECT_URI = 'http://localhost:8081/callback'

export const AUTH_URL = `${KC_BASE_EXTERNAL}/realms/${KC_REALM}/protocol/openid-connect/auth`
export const TOKEN_URL = `${KC_BASE_INTERNAL}/realms/${KC_REALM}/protocol/openid-connect/token`
export const LOGOUT_URL = `${KC_BASE_EXTERNAL}/realms/${KC_REALM}/protocol/openid-connect/logout`
