/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { computed, reactive, ref } from 'vue';
import { defineStore } from 'pinia';
import { useLoading } from '@sa/hooks';
import { router } from '@/router';
import { fetchGetUserInfo, fetchLogin, fetchLogout } from '@/service/api';
import { useRouterPush } from '@/hooks/common/router';
import { localStg } from '@/utils/storage';
import { SetupStoreId } from '@/enum';
import { $t } from '@/locales';
import { useRouteStore } from '../route';
import { useTabStore } from '../tab';
import { clearAuthStorage, getToken } from './shared';

export const useAuthStore = defineStore(SetupStoreId.Auth, () => {
  const routeStore = useRouteStore();
  const tabStore = useTabStore();
  const { toHome, toLogin } = useRouterPush(false);
  const { loading: loginLoading, startLoading, endLoading } = useLoading();

  const token = ref(getToken());

  const userInfo: Api.Auth.UserInfo = reactive({
    userId: '',
    userName: '',
    roles: [],
    buttons: []
  });

  /** is super role in static route */
  const isStaticSuper = computed(() => {
    const { VITE_AUTH_ROUTE_MODE, VITE_STATIC_SUPER_ROLE } = import.meta.env;

    return VITE_AUTH_ROUTE_MODE === 'static' && userInfo.roles.includes(VITE_STATIC_SUPER_ROLE);
  });

  /** Is login */
  const isLogin = computed(() => Boolean(token.value));

  /** Reset auth store */
  async function resetStore(callLogoutApi = true) {
    recordUserId();

    // 只在需要时调用后端注销API
    if (callLogoutApi) {
      try {
        await fetchLogout();
      } catch (error) {
        // 注销失败，显示错误提示，保持登录状态
        // eslint-disable-next-line no-console
        console.error('Logout API failed:', error);
        window.$message?.error?.($t('common.logoutFailed'));
        return;
      }
    }

    // 成功后清理前端
    clearAuthStorage();
    // 手动重置状态
    token.value = '';
    Object.assign(userInfo, {
      userId: '',
      userName: '',
      roles: [],
      buttons: []
    });
    await tabStore.clearTabs();
    await routeStore.resetStore();

    // 直接跳转到登录页面，避免params处理正则表达式路径的问题
    await toLogin();
  }

  /** Record the user ID of the previous login session Used to compare with the current user ID on next login */
  function recordUserId() {
    if (!userInfo.userId) {
      return;
    }

    // Store current user ID locally for next login comparison
    localStg.set('lastLoginUserId', userInfo.userId);
  }

  /**
   * Check if current login user is different from previous login user If different, clear all tabs
   *
   * @returns {boolean} Whether to clear all tabs
   */
  function checkTabClear(): boolean {
    if (!userInfo.userId) {
      return false;
    }

    const lastLoginUserId = localStg.get('lastLoginUserId');

    // Clear all tabs if current user is different from previous user
    if (lastLoginUserId !== userInfo.userId) {
      localStg.remove('globalTabs');
      tabStore.clearTabs();

      return true;
    }

    return false;
  }

  /**
   * Login
   *
   * @param userName User name
   * @param password Password
   * @param [captchaCode] Image verification code
   * @param [captchaKey] Captcha key
   * @param [redirect=true] Whether to redirect after login. Default is `true`
   */
  // eslint-disable-next-line max-params
  async function login(
    userName: string,
    password: string,
    captchaCode: string = '',
    captchaKey: string = '',
    rememberMe: boolean = false,
    redirect = true
  ) {
    startLoading();

    try {
      const { data: loginToken, error } = await fetchLogin(userName, password, captchaCode, captchaKey, rememberMe);

      if (!error) {
        const pass = await loginByToken(loginToken);

        if (pass) {
          // Check if the tab needs to be cleared
          const isClear = checkTabClear();
          let needRedirect = redirect;

          if (isClear) {
            // If the tab needs to be cleared,it means we don't need to redirect.
            needRedirect = false;
          }
          // 登录成功后跳转到首页
          if (typeof toHome === 'function') {
            await toHome();
          } else {
            // 后备方案：直接跳转到首页
            console.warn('toHome is not a function, falling back to router.push');
            await router.push('/');
          }

          window.$notification?.success({
            title: $t('page.login.common.loginSuccess'),
            message: $t('page.login.common.welcomeBack', { userName: userInfo.userName }),
            duration: 4500
          });
        } else {
          // loginByToken 失败，抛出错误
          throw new Error('Failed to get user info');
        }
      } else {
        // fetchLogin 失败，抛出错误
        throw error;
      }
    } finally {
      endLoading();
    }
  }

  async function loginByToken(loginToken: Api.Auth.LoginToken) {
    // 1. stored in the localStorage, the later requests need it in headers
    localStg.set('token', loginToken.token);
    localStg.set('refreshToken', loginToken.refreshToken);

    // 2. get user info
    const pass = await getUserInfo();

    if (pass) {
      token.value = loginToken.token;

      return true;
    }

    return false;
  }

  async function getUserInfo() {
    const { data: info, error } = await fetchGetUserInfo();

    if (!error) {
      // update store
      Object.assign(userInfo, info);

      return true;
    }

    return false;
  }

  async function initUserInfo() {
    const hasToken = getToken();

    if (hasToken) {
      const pass = await getUserInfo();

      if (!pass) {
        resetStore();
      }
    }
  }

  return {
    token,
    userInfo,
    isStaticSuper,
    isLogin,
    loginLoading,
    resetStore,
    login,
    initUserInfo
  };
});
