import { createAlovaRequest } from '@sa/alova';
import adapterFetch from '@sa/alova/fetch';
import { useAuthStore } from '@/store/modules/auth';
import { getServiceBaseURL } from '@/utils/service';
import { $t } from '@/locales';
import { getAuthorization, handleRefreshToken, showErrorMsg } from './shared';
import type { RequestInstanceState } from './type';

const isHttpProxy = import.meta.env.DEV && import.meta.env.VITE_HTTP_PROXY === 'Y';
const { baseURL } = getServiceBaseURL(import.meta.env, isHttpProxy);

const state: RequestInstanceState = {
  errMsgStack: []
};
export const alova = createAlovaRequest(
  {
    baseURL,
    requestAdapter: adapterFetch()
  },
  {
    onRequest(methodInstance) {
      const config = methodInstance.config;
      const Authorization = getAuthorization();
      config.headers.Authorization = Authorization;
      config.headers.apifoxToken = 'XL299LiMEDZ0H5h3A29PxwQXdMJqWyY2';
      // 如果 data 是 FormData，移除 Content-Type header（包括大小写），让浏览器自动设置
      if (methodInstance.data instanceof FormData) {
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
      }
    },
    tokenRefresher: {
      async isExpired(_response) {
        // 临时禁用刷新token功能，因为后端端点可能不存在
        return false;
        // const expiredTokenCodes = import.meta.env.VITE_SERVICE_EXPIRED_TOKEN_CODES?.split(',') || [];
        // const { code } = await response.clone().json();
        // return expiredTokenCodes.includes(String(code));
      },
      async handler() {
        await handleRefreshToken();
      }
    },
    async isBackendSuccess(response) {
      // Check if response is a blob (image or binary data)
      const contentType = response.headers.get('content-type') || '';

      if (contentType.startsWith('image/') || contentType === 'application/octet-stream') {
        return true;
      }

      // when the backend response code is "0000"(default), it means the request is success
      // to change this logic by yourself, you can modify the `VITE_SERVICE_SUCCESS_CODE` in `.env` file
      const resp = response.clone();
      const data = await resp.json();
      const isSuccess = String(data.code) === import.meta.env.VITE_SERVICE_SUCCESS_CODE;
      return isSuccess;
    },
    async transformBackendResponse(response) {
      // Check if response is a blob (image or binary data)
      const contentType = response.headers.get('content-type') || '';

      if (contentType.startsWith('image/') || contentType === 'application/octet-stream') {
        return await response.blob();
      }

      const jsonData = await response.clone().json();
      // 如果有 data 字段就返回 data，否则返回整个响应（包含 message）
      return jsonData.data !== undefined ? jsonData.data : jsonData;
    },
    async onError(error, response) {
      const authStore = useAuthStore();

      let message = error.message;
      let responseCode = '';
      let requestUrl = '';

      if (response) {
        try {
          const data = await response?.clone().json();
          message = data.message || error.message;
          responseCode = String(data.code);
          requestUrl = response.url || '';
        } catch {
          // 如果解析 JSON 失败，使用原始错误消息
          message = error.message;
          requestUrl = response.url || '';
        }
      }

      // 对于特定的请求，使用自定义的错误消息
      const customErrorMessages: Record<string, string> = {
        '/user/changePassword': '修改密码失败'
      };
      for (const [urlPart, customMsg] of Object.entries(customErrorMessages)) {
        if (requestUrl.includes(urlPart)) {
          message = customMsg;
          break;
        }
      }

      function handleLogout() {
        showErrorMsg(state, message);
        authStore.resetStore();
      }

      function logoutAndCleanup() {
        handleLogout();
        window.removeEventListener('beforeunload', handleLogout);
        state.errMsgStack = state.errMsgStack.filter(msg => msg !== message);
      }

      // when the backend response code is in `logoutCodes`, it means the user will be logged out and redirected to login page
      const logoutCodes = import.meta.env.VITE_SERVICE_LOGOUT_CODES?.split(',') || [];
      if (logoutCodes.includes(responseCode)) {
        handleLogout();
        throw error;
      }

      // when the backend response code is in `modalLogoutCodes`, it means the user will be logged out by displaying a modal
      const modalLogoutCodes = import.meta.env.VITE_SERVICE_MODAL_LOGOUT_CODES?.split(',') || [];
      if (modalLogoutCodes.includes(responseCode) && !state.errMsgStack?.includes(message)) {
        state.errMsgStack = [...(state.errMsgStack || []), message];

        // prevent the user from refreshing the page
        window.addEventListener('beforeunload', handleLogout);

        if (window.$messageBox) {
          window.$messageBox({
            type: 'error',
            title: $t('common.error'),
            message,
            confirmButtonText: $t('common.confirm'),
            closeOnClickModal: false,
            closeOnPressEscape: false,
            callback() {
              logoutAndCleanup();
            }
          });
        }
        throw error;
      }

      showErrorMsg(state, message);
      throw error;
    }
  }
);
