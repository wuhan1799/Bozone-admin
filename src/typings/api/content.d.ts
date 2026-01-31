declare namespace Api {
  /**
   * namespace Content
   *
   * backend api module: "content"
   */
  namespace Content {
    type CommonSearchParams = Pick<Common.PaginatingCommonParams, 'current' | 'size'>;

    /**
     * category status
     *
     * - "0": "hide"
     * - "1": "show"
     */
    type CategoryStatus = '0' | '1';

    /** article category */
    type ArticleCategory = {
      /** record id */
      id: number;
      /** category name */
      name: string;
      /** sort order */
      sortOrder: number;
      /** status: 0=hide, 1=show */
      status: number;
    };

    /** article category search params */
    type ArticleCategorySearchParams = CommonType.RecordNullable<
      Pick<Api.Content.ArticleCategory, 'name' | 'status'> & CommonSearchParams
    >;

    /** article category list */
    type ArticleCategoryList = Common.PaginatingQueryRecord<ArticleCategory>;

    /** article */
    type Article = {
      /** record id */
      id: number;
      /** article title */
      title: string;
      /** article content */
      content: string;
      /** category id */
      categoryId?: number;
      /** category name */
      catName: string;
      /** cover images (JSON array of image URLs) */
      images: string;
      /** sort order (weigh) */
      weigh: number;
      /** status: 0=hide, 1=show */
      status: number;
    };

    /** article search params */
    type ArticleSearchParams = CommonType.RecordNullable<
      Pick<Api.Content.Article, 'title' | 'categoryId' | 'status'> & CommonSearchParams
    >;

    /** article list */
    type ArticleList = Common.PaginatingQueryRecord<Article>;

    /** guide */
    type Guide = {
      /** record id */
      id: number;
      /** guide title */
      title: string;
      /** guide subtitle */
      subtitle: string;
      /** guide icon */
      icon: string;
      /** release date */
      releaseDate: string;
      /** guide content */
      content: string;
      /** sort order (weigh) */
      weigh: number;
      /** status: 0=hide, 1=show */
      status: string;
      /** create time */
      createtime: number;
    };

    /** guide search params */
    type GuideSearchParams = CommonType.RecordNullable<
      Pick<Api.Content.Guide, 'title' | 'status'> & CommonSearchParams
    >;

    /** guide list */
    type GuideList = Common.PaginatingQueryRecord<Guide>;
  }
}
