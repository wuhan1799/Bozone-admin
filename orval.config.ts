import { defineConfig } from 'orval';

export default defineConfig({
  'elp-api': {
    input: {
      target: 'http://api.cn/swagger.json'
    },
    output: {
      target: './src/api/generated/index.ts',
      client: 'vue-query',
      mode: 'tags-split',
      clean: true,
      mock: false,
      prettier: false,
      override: {
        mutator: {
          path: './src/service-alova/request/orval-instance.ts',
          name: 'apiAlova'
        },
        operations: {},
        operationName: (operation: any, _route: string, _verb: string): string => {
          // 防止操作名称以数字开头，添加 Op 前缀
          const id = operation.operationId;
          return id && /^\d/.test(id) ? `Op${id}` : id || '';
        }
      }
    }
  }
});
