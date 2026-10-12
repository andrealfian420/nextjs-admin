// Auth inputs and responses for the cookie-backed BFF routes (/api/auth/*).

export interface LoginInput {
  email: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

/** Body of POST /auth/reset-password; `token` comes from the reset email link. */
export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

/** `data` of login and refresh responses. The refresh token itself stays in an HttpOnly cookie. */
export interface AccessTokenData {
  accessToken: string;
}

/**
 * REGULAR_LOGOUT revokes the session on the backend; PROFILE_PASSWORD_CHANGED only clears the
 * local cookie because the backend already revoked every session.
 */
export type LogoutType = 'REGULAR_LOGOUT' | 'PROFILE_PASSWORD_CHANGED';
