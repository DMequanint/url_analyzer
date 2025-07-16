// src/types/url.ts

export interface UrlData {
  id: string;
  url: string;
  normalized_url: string;

  htmlVersion: string;           // HTML document version
  pageTitle: string;             // <title> tag content

  h1: number;
  h2: number;
  h3: number;
  h4: number;
  h5: number;
  h6: number;

  internalLinks: number;
  externalLinks: number;
  inaccessibleLinks: number;

  hasLoginForm: boolean;

  status: string;
  errorReason?: string;
  errorCode?: number;

  createdAt?: string;
  updatedAt?: string;
}

export interface LinkDetail {
  url: string;
  status: string;
  type: 'internal' | 'external';
}

export interface UrlDetailData extends UrlData {
  brokenLinksDetails?: LinkDetail[]; // optional full metadata on broken links
}

