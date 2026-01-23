import type {
  LocationQueryRaw,
  NavigationGuardNext,
  RouteLocationNormalized,
  RouteLocationRaw,
  Router
} from 'vue-router';
import type { RouteKey, RoutePath } from '@elegant-router/types';
import { useAuthStore } from '@/store/modules/auth';
import { useRouteStore } from '@/store/modules/route';
import { localStg } from '@/utils/storage';
import { getRouteName } from '@/router/elegant/transform';

/**
 * create route guard
 *
 * @param router router instance
 */
export function createRouteGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    const location = await initRoute(to);

    if (location) {
      next(location);
      return;
    }

    const authStore = useAuthStore();

    const rootRoute: RouteKey = 'root';
    const loginRoute: RouteKey = 'login';
    const noAuthorizationRoute: RouteKey = '403';

    const isLogin = Boolean(localStg.get('token'));
    const isLoggingOut = authStore.isLoggingOut;
    const needLogin = !to.meta.constant;
    const routeRoles = to.meta.roles || [];

    // 在动态路由模式下，后端已经过滤了路由，不需要前端再检查权限
    const { VITE_AUTH_ROUTE_MODE } = import.meta.env;
    const isDynamicMode = VITE_AUTH_ROUTE_MODE === 'dynamic';

    let hasAuth = true;
    if (!isDynamicMode) {
      // 静态模式下，需要检查前端定义的 roles
      const hasRole = authStore.userInfo.roles.some(role => routeRoles.includes(role));
      hasAuth = authStore.isStaticSuper || hasRole;
    } else if (to.name === 'home') {
      // 动态模式下，需要特殊检查首页访问权限
      // 只有管理员(super_admin, admin)可以访问首页
      const userRoles = Array.from(authStore.userInfo.roles || []);
      hasAuth = userRoles.some(role => role === 'super_admin' || role === 'admin');
    }

    // if it is login route when logged in, then switch to the root page
    if (to.name === loginRoute && isLogin) {
      const redirect = to.query?.redirect as string;
      if (redirect) {
        next({ path: redirect });
      } else {
        next({ name: rootRoute });
      }
      return;
    }

    // if the route does not need login, then it is allowed to access directly
    if (!needLogin) {
      handleRouteSwitch(to, from, next);
      return;
    }

    // the route need login but the user is not logged in, then switch to the login page
    if (!isLogin) {
      // 如果正在退出登录，不添加redirect参数，避免新用户登录后跳转到旧用户的页面
      const query = isLoggingOut ? {} : { redirect: to.fullPath };
      next({ name: loginRoute, query });
      return;
    }

    // if the user is logged in but does not have authorization, then switch to the 403 page
    if (!hasAuth) {
      // 特殊处理：非管理员用户访问首页时，重定向到个人中心而不是403
      if (to.name === 'home') {
        next({ name: 'user-center' });
      } else {
        next({ name: noAuthorizationRoute });
      }
      return;
    }

    // switch route normally
    handleRouteSwitch(to, from, next);
  });
}

/**
 * initialize route
 *
 * @param to to route
 */
async function initRoute(to: RouteLocationNormalized): Promise<RouteLocationRaw | null> {
  const routeStore = useRouteStore();

  const notFoundRoute: RouteKey = 'not-found';
  const isNotFoundRoute = to.name === notFoundRoute;

  // if the constant route is not initialized, then initialize the constant route
  if (!routeStore.isInitConstantRoute) {
    await routeStore.initConstantRoute();

    // the route is captured by the "not-found" route because the constant route is not initialized
    // after the constant route is initialized, redirect to the original route
    const path = to.fullPath;
    const location: RouteLocationRaw = {
      path,
      replace: true,
      query: to.query,
      hash: to.hash
    };

    return location;
  }

  const isLogin = Boolean(localStg.get('token'));

  if (!isLogin) {
    // if the user is not logged in and the route is a constant route but not the "not-found" route, then it is allowed to access.
    if (to.meta.constant && !isNotFoundRoute) {
      routeStore.onRouteSwitchWhenNotLoggedIn();

      return null;
    }

    // if the user is not logged in, then switch to the login page
    const authStore = useAuthStore();
    const loginRoute: RouteKey = 'login';
    const query = getRouteQueryOfLoginRoute(to, routeStore.routeHome, authStore.isLoggingOut);

    const location: RouteLocationRaw = {
      name: loginRoute,
      query
    };

    return location;
  }

  if (!routeStore.isInitAuthRoute) {
    // initialize the auth route
    await routeStore.initAuthRoute();

    // the route is captured by the "not-found" route because the auth route is not initialized
    // after the auth route is initialized, redirect to the original route
    if (isNotFoundRoute) {
      const rootRoute: RouteKey = 'root';
      const path = to.redirectedFrom?.name === rootRoute ? '/' : to.fullPath;

      const location: RouteLocationRaw = {
        path,
        replace: true,
        query: to.query,
        hash: to.hash
      };

      return location;
    }
  }

  routeStore.onRouteSwitchWhenLoggedIn();

  // the auth route is initialized
  // it is not the "not-found" route, then it is allowed to access
  if (!isNotFoundRoute) {
    return null;
  }

  // it is captured by the "not-found" route, then check whether the route exists
  const exist = await routeStore.getIsAuthRouteExist(to.path as RoutePath);
  const noPermissionRoute: RouteKey = '403';

  if (exist) {
    const location: RouteLocationRaw = {
      name: noPermissionRoute
    };

    return location;
  }

  return null;
}

function handleRouteSwitch(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
  // route with href
  if (to.meta.href) {
    window.open(to.meta.href, '_blank');

    next({ path: from.fullPath, replace: true, query: from.query, hash: from.hash });

    return;
  }

  next();
}

function getRouteQueryOfLoginRoute(to: RouteLocationNormalized, routeHome: RouteKey, isLoggingOut?: boolean) {
  // 如果正在退出登录，不添加redirect参数
  if (isLoggingOut) {
    return {};
  }

  const loginRoute: RouteKey = 'login';
  const redirect = to.fullPath;
  const [redirectPath, redirectQuery] = redirect.split('?');
  const redirectName = getRouteName(redirectPath as RoutePath);

  const isRedirectHome = routeHome === redirectName;

  const query: LocationQueryRaw = to.name !== loginRoute && !isRedirectHome ? { redirect } : {};

  if (isRedirectHome && redirectQuery) {
    query.redirect = `/?${redirectQuery}`;
  }

  return query;
}
