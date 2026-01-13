import { alova } from './index';

/**
 * Orval 的 Alova 适配器
 * 将 Orval 生成的请求配置转换为 Alova 请求
 */
export async function apiAlova<T>(config: any): Promise<T> {
  const { method, url, params, data, headers: orvalHeaders } = config;

  // 过滤掉 undefined 的参数
  const cleanParams = Object.fromEntries(Object.entries(params || {}).filter(([_, v]) => v !== undefined));

  // 处理 data：如果是 FormData 则直接使用，否则过滤 undefined
  const cleanData =
    data instanceof FormData
      ? data
      : Object.fromEntries(Object.entries(data || {}).filter(([_, v]) => v !== undefined));

  // 处理 headers：如果是 FormData，不传递任何 headers，让浏览器自动设置 Content-Type
  let finalHeaders: any;
  if (cleanData instanceof FormData) {
    // FormData 时不设置任何 headers，让浏览器自动设置 Content-Type
    finalHeaders = undefined;
  } else if (orvalHeaders) {
    finalHeaders = orvalHeaders;
  }

  let response: any;

  switch (method.toUpperCase()) {
    case 'GET':
      response = await alova.Get<T>(url, {
        params: cleanParams
      });
      break;

    case 'POST':
      response = await alova.Post<T>(url, cleanData, finalHeaders ? { headers: finalHeaders } : undefined);
      break;

    case 'PUT':
      response = await alova.Put<T>(url, cleanData, finalHeaders ? { headers: finalHeaders } : undefined);
      break;

    case 'DELETE':
      response = await alova.Delete<T>(url, {
        params: cleanParams
      });
      break;

    case 'PATCH':
      response = await alova.Patch<T>(url, cleanData, finalHeaders ? { headers: finalHeaders } : undefined);
      break;

    default:
      throw new Error(`Unsupported HTTP method: ${method}`);
  }

  // 从响应中提取 data 字段
  return response?.data ?? response;
}
