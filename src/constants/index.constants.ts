export const authExpire = {
  accessToken: 60 * 60 * 24,
  refreshToken: 60 * 60 * 24 * 30,
  sessionToken: 60 * 60 * 24,
}

export const httpStatus = {
  OK: 200,
  PARTIAL_CONTENT: 207,
  FORBIDDEN: 403,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  INTERNAL_SERVER_ERROR: 500,
}
