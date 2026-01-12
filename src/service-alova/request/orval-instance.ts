import { alova } from './index';

/**
 * Orval 的 Alova 适配器
 * 将 Orval 生成的请求配置转换为 Alova 请求
 */
export async function apiAlova<T>(config: any): Promise<T> {
  const { method, url, params, data } = config;

  // 过滤掉 undefined 的参数
  const cleanParams = Object.fromEntries(Object.entries(params || {}).filter(([_, v]) => v !== undefined));
  const cleanData = Object.fromEntries(Object.entries(data || {}).filter(([_, v]) => v !== undefined));

  let response: any;

  switch (method.toUpperCase()) {
    case 'GET':
      response = await alova.Get<T>(url, {
        params: cleanParams
      });
      break;

    case 'POST':
      response = await alova.Post<T>(url, cleanData);
      break;

    case 'PUT':
      response = await alova.Put<T>(url, cleanData);
      break;

    case 'DELETE':
      response = await alova.Delete<T>(url, {
        params: cleanParams
      });
      break;

    case 'PATCH':
      response = await alova.Patch<T>(url, cleanData);
      break;

    default:
      throw new Error(`Unsupported HTTP method: ${method}`);
  }

  return response;
}
