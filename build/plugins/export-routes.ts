import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';

/* eslint-disable no-console */
export function exportRoutesPlugin(): Plugin {
  return {
    name: 'export-routes',
    writeBundle() {
      try {
        console.log('🚀 开始导出路由到 JSON...');

        // eslint-disable-next-line n/prefer-global/process
        const routesFilePath = resolve(process.cwd(), 'src/router/elegant/routes.ts');

        if (!existsSync(routesFilePath)) {
          console.error('❌ routes.ts 文件不存在:', routesFilePath);
          return;
        }

        const routesContent = readFileSync(routesFilePath, 'utf-8');

        const match = routesContent.match(/export const generatedRoutes.*?=\s*(\[([\s\S]*?)\]);/);

        if (!match) {
          console.error('❌ 无法提取 generatedRoutes 数组');
          return;
        }

        let routes: any[];
        try {
          // eslint-disable-next-line no-new-func
          const parseRoutes = new Function(`return ${match[1]}`);
          routes = parseRoutes();
        } catch (error) {
          console.error('❌ 解析路由数据失败:', error);
          return;
        }

        const pages: Array<{
          routeName: string;
          routePath: string;
          componentPath: string;
          pageName: string;
          i18nKey: string;
          category: string;
        }> = [];

        const processRoute = (route: any, category = 'default') => {
          if (!route) return;

          if (route.children && Array.isArray(route.children) && route.children.length > 0) {
            route.children.forEach((child: any) => processRoute(child, category));
            return;
          }

          const excludeRoutes = ['403', '404', '500', 'login'];
          if (excludeRoutes.includes(route.name)) {
            return;
          }

          pages.push({
            routeName: route.name,
            routePath: route.path,
            componentPath: route.component || '',
            pageName: route.meta?.title || route.name,
            i18nKey: route.meta?.i18nKey || `route.${route.name}`,
            category
          });
        };

        routes.forEach((route: any) => {
          let category = 'default';
          const path = route.path;

          if (path.startsWith('/manage')) category = 'manage';
          else if (path.startsWith('/home')) category = 'home';
          else if (path.startsWith('/alova')) category = 'alova';
          else if (path.startsWith('/function')) category = 'function';
          else if (path.startsWith('/about')) category = 'about';

          processRoute(route, category);
        });

        const exportData = {
          generateTime: new Date().toISOString(),
          total: pages.length,
          pages
        };

        // eslint-disable-next-line n/prefer-global/process
        const publicDir = resolve(process.cwd(), 'public');
        if (!existsSync(publicDir)) {
          mkdirSync(publicDir, { recursive: true });
        }

        const outputPath = resolve(publicDir, 'routes.json');
        writeFileSync(outputPath, JSON.stringify(exportData, null, 2), 'utf-8');

        console.log(`✅ 路由导出成功: ${outputPath}`);
        console.log(`📊 共导出 ${pages.length} 个页面`);
      } catch (error) {
        console.error('❌ 导出路由失败:', error);
        throw error;
      }
    }
  };
}
