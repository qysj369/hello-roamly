export type PageSeo = {
  title: string;
  description?: string;
  /** 站内路径，如 /discover；用于 canonical 与 og:url */
  path?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  /** 禁止收录（404 等） */
  noIndex?: boolean;
};
