import type { App } from 'vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';

/**
 * VueQueryClient 配置
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 分钟
      gcTime: 10 * 60 * 1000 // 10 分钟
    }
  }
});

/**
 * 设置 VueQuery 插件
 */
export function setupVueQuery(app: App) {
  app.use(VueQueryPlugin, { queryClient });
}
