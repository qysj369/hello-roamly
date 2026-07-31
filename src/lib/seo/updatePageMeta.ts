import {
  DEFAULT_OG_IMAGE_URL,
  DEFAULT_SITE_DESCRIPTION,
  resolveSiteOrigin,
  SITE_NAME,
} from '@/lib/seo/config';
import type { PageSeo } from '@/lib/seo/types';

const MANAGED_SELECTOR = 'data-roamly-seo';

function upsertMeta(
  attribute: 'name' | 'property',
  key: string,
  content: string,
) {
  if (typeof document === 'undefined') {
    return;
  }

  const selector = `meta[${attribute}="${key}"]`;
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    element.setAttribute(MANAGED_SELECTOR, 'true');
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  if (typeof document === 'undefined') {
    return;
  }

  let element = document.head.querySelector<HTMLLinkElement>(
    `link[rel="${rel}"][${MANAGED_SELECTOR}]`,
  );

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    element.setAttribute(MANAGED_SELECTOR, 'true');
    document.head.appendChild(element);
  }

  element.setAttribute('href', href);
}

function removeManagedMeta() {
  if (typeof document === 'undefined') {
    return;
  }

  document.head.querySelectorAll(`[${MANAGED_SELECTOR}]`).forEach((node) => {
    node.remove();
  });
}

export function applyPageSeo(seo: PageSeo): () => void {
  if (typeof document === 'undefined') {
    return () => undefined;
  }

  const previousTitle = document.title;
  const description = seo.description ?? DEFAULT_SITE_DESCRIPTION;
  const origin = resolveSiteOrigin();
  const path = seo.path ?? (typeof window !== 'undefined' ? window.location.pathname : '/');
  const canonicalUrl = `${origin}${path.startsWith('/') ? path : `/${path}`}`;
  const ogImage = seo.ogImage ?? DEFAULT_OG_IMAGE_URL;
  const ogType = seo.ogType ?? 'website';

  document.title = seo.title;

  upsertMeta('name', 'description', description);
  upsertMeta('name', 'robots', seo.noIndex ? 'noindex, nofollow' : 'index, follow');

  upsertMeta('property', 'og:site_name', SITE_NAME);
  upsertMeta('property', 'og:title', seo.title);
  upsertMeta('property', 'og:description', description);
  upsertMeta('property', 'og:type', ogType);
  upsertMeta('property', 'og:url', canonicalUrl);
  upsertMeta('property', 'og:image', ogImage);
  upsertMeta('property', 'og:locale', 'zh_CN');

  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', seo.title);
  upsertMeta('name', 'twitter:description', description);
  upsertMeta('name', 'twitter:image', ogImage);

  upsertLink('canonical', canonicalUrl);

  return () => {
    document.title = previousTitle;
    removeManagedMeta();
  };
}
