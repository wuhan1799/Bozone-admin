import { request } from '../request';

/** get article category list */
export function fetchGetArticleCategoryList(params?: Api.Content.ArticleCategorySearchParams) {
  return request<Api.Content.ArticleCategoryList>({
    url: '/content/articleCategoryList',
    method: 'get',
    params
  });
}

/** add article category */
export function fetchAddArticleCategory(data: Api.Content.ArticleCategory) {
  return request<null>({
    url: '/content/addArticleCategory',
    method: 'post',
    data
  });
}

/** update article category */
export function fetchUpdateArticleCategory(data: Api.Content.ArticleCategory) {
  return request<null>({
    url: '/content/updateArticleCategory',
    method: 'post',
    data
  });
}

/** delete article category */
export function fetchDeleteArticleCategory(id: number) {
  return request<null>({
    url: '/content/deleteArticleCategory',
    method: 'delete',
    params: { id }
  });
}

/** batch delete article categories */
export function fetchBatchDeleteArticleCategory(ids: number[]) {
  return request<null>({
    url: '/content/batchDeleteArticleCategory',
    method: 'delete',
    data: { ids }
  });
}

/** get article list */
export function fetchGetArticleList(params?: Api.Content.ArticleSearchParams) {
  return request<Api.Content.ArticleList>({
    url: '/content/articleList',
    method: 'get',
    params
  });
}

/** add article */
export function fetchAddArticle(data: Api.Content.Article) {
  return request<null>({
    url: '/content/addArticle',
    method: 'post',
    data
  });
}

/** update article */
export function fetchUpdateArticle(data: Api.Content.Article) {
  return request<null>({
    url: '/content/updateArticle',
    method: 'post',
    data
  });
}

/** delete article */
export function fetchDeleteArticle(id: number) {
  return request<null>({
    url: '/content/deleteArticle',
    method: 'delete',
    params: { id }
  });
}

/** batch delete articles */
export function fetchBatchDeleteArticle(ids: number[]) {
  return request<null>({
    url: '/content/batchDeleteArticle',
    method: 'delete',
    data: { ids }
  });
}

/** get guide list */
export function fetchGetGuideList(params?: Api.Content.GuideSearchParams) {
  return request<Api.Content.GuideList>({
    url: '/content/guideList',
    method: 'get',
    params
  });
}

/** add guide */
export function fetchAddGuide(data: Api.Content.Guide) {
  return request<null>({
    url: '/content/addGuide',
    method: 'post',
    data
  });
}

/** update guide */
export function fetchUpdateGuide(data: Api.Content.Guide) {
  return request<null>({
    url: '/content/updateGuide',
    method: 'post',
    data
  });
}

/** delete guide */
export function fetchDeleteGuide(id: number) {
  return request<null>({
    url: '/content/deleteGuide',
    method: 'delete',
    params: { id }
  });
}

/** batch delete guides */
export function fetchBatchDeleteGuide(ids: number[]) {
  return request<null>({
    url: '/content/batchDeleteGuide',
    method: 'delete',
    data: { ids }
  });
}
