import { alova } from '../request';

/**
 * Login
 *
 * @param userName User name
 * @param password Password
 * @param [imgCode] Image verification code
 */
export function fetchLogin(userName: string, password: string, imgCode?: string) {
  return alova.Post<Api.Auth.LoginToken>('/auth/login', { userName, password, imgCode });
}

/** Get user info */
export function fetchGetUserInfo() {
  return alova.Get<Api.Auth.UserInfo>('/auth/getUserInfo');
}

/** Send captcha to target phone */
export function sendCaptcha(phone: string) {
  return alova.Post<null>('/auth/sendCaptcha', { phone });
}

/** Send captcha to email */
export function sendEmailCaptcha(email: string) {
  return alova.Post<null>('/auth/sendEmailCaptcha', { email });
}

/** Verify captcha */
export function verifyCaptcha(phone: string, code: string) {
  return alova.Post<null>('/auth/verifyCaptcha', { phone, code });
}

/** Get image captcha */
export function getImageCaptcha() {
  return alova.Get<Blob>('/auth/captcha', {
    meta: {
      authRole: 'none'
    }
  });
}

/**
 * Refresh token
 *
 * @param refreshToken Refresh token
 */
export function fetchRefreshToken(refreshToken: string) {
  return alova.Post<Api.Auth.LoginToken>(
    '/auth/refreshToken',
    { refreshToken },
    {
      meta: {
        authRole: 'refreshToken'
      }
    }
  );
}

/**
 * return custom backend error
 *
 * @param code error code
 * @param msg error message
 */
export function fetchCustomBackendError(code: string, msg: string) {
  return alova.Get('/auth/error', {
    params: { code, msg },
    shareRequest: false
  });
}
