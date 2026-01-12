import { useC3457fc283d3f681bee0df9c9a41350f } from '@/api/generated/邮件验证/邮件验证';
import { request } from '../request';

/**
 * Login
 *
 * @param userName User name
 * @param password Password
 * @param [captchaCode] Image verification code
 * @param [captchaKey] Captcha key
 */
// eslint-disable-next-line max-params
export function fetchLogin(
  userName: string,
  password: string,
  captchaCode: string = '',
  captchaKey: string = '',
  rememberMe: boolean = false
) {
  return request<Api.Auth.LoginToken>({
    url: '/auth/login',
    method: 'post',
    data: {
      userName,
      password,
      captchaCode,
      captchaKey,
      rememberMe
    }
  });
}

/** Get user info */
export function fetchGetUserInfo() {
  return request<Api.Auth.UserInfo>({ url: '/auth/getUserInfo' });
}

/**
 * Refresh token
 *
 * @param refreshToken Refresh token
 */
export function fetchRefreshToken(refreshToken: string) {
  return request<Api.Auth.LoginToken>({
    url: '/auth/refreshToken',
    method: 'post',
    data: {
      refreshToken
    }
  });
}

/**
 * return custom backend error
 *
 * @param code error code
 * @param msg error message
 */
export function fetchCustomBackendError(code: string, msg: string) {
  return request({ url: '/auth/error', params: { code, msg } });
}

/** Logout */
export function fetchLogout() {
  return request<null>({ url: '/auth/logout', method: 'post', data: {} });
}

/**
 * Verify email code
 *
 * @param email Email address
 * @param code Verification code
 */
export async function fetchVerifyEmailCode(email: string, code: string) {
  const mutation = useC3457fc283d3f681bee0df9c9a41350f();
  return mutation.mutateAsync({ data: { email, code } });
}
