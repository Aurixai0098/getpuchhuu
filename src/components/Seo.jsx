// src/components/Seo.jsx
// Har page ke liye title / description / canonical / Open Graph / Twitter / JSON-LD set karta hai.
// Usage:  <Seo title="AC Service" description="..." path="/category/ac-service" jsonLd={{...}} />
// Private pages (cart, checkout, profile...) par: <Seo noindex />
import { useEffect } from 'react';

export const SITE_URL = 'https://www.puchhuu.com';
export const SITE_NAME = 'Puchhuu';
export const DEFAULT_IMAGE =
  'https://res.cloudinary.com/djtvxmttf/image/upload/v1792055959/378c9470-484d-4d3e-b4d1-9054b714fd20.png';
const DEFAULT_TITLE = 'Puchhuu – Book Trusted Home Services Online';
const DEFAULT_DESCRIPTION =
  'Book verified home service professionals with Puchhuu: AC service & repair, home cleaning, sofa cleaning, plumbing, electrician, painting and more. Transparent pricing, on-time service.';

// head tag ko update karo (ya bana do) aur purani value wapas karne wala function lautao
function upsertHead(selector, create, attrs) {
  let el = document.head.querySelector(selector);
  let created = false;
  if (!el) {
    el = create();
    document.head.appendChild(el);
    created = true;
  }
  const prev = {};
  Object.keys(attrs).forEach((k) => {
    prev[k] = el.getAttribute(k);
    el.setAttribute(k, attrs[k]);
  });
  return () => {
    if (created) el.remove();
    else Object.keys(prev).forEach((k) => (prev[k] === null ? el.removeAttribute(k) : el.setAttribute(k, prev[k])));
  };
}
const metaName = (name, content) =>
  upsertHead(`meta[name="${name}"]`, () => { const m = document.createElement('meta'); m.setAttribute('name', name); return m; }, { content });
const metaProp = (prop, content) =>
  upsertHead(`meta[property="${prop}"]`, () => { const m = document.createElement('meta'); m.setAttribute('property', prop); return m; }, { content });

const trim = (text = '', max = 160) => {
  const clean = String(text).replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
};

export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  image = DEFAULT_IMAGE,
  type = 'website',
  noindex = false,
  jsonLd,
}) {
  const jsonLdString = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    const fullTitle = title
      ? (/puchhuu/i.test(title) ? title : `${title} | ${SITE_NAME}`)
      : DEFAULT_TITLE;
    const desc = trim(description);
    const pagePath = path !== undefined ? path : window.location.pathname;
    const url = `${SITE_URL}${pagePath === '/' ? '/' : pagePath.replace(/\/$/, '')}`;

    const prevTitle = document.title;
    document.title = fullTitle;

    const undo = [
      metaName('description', desc),
      metaName('robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'),
      upsertHead('link[rel="canonical"]', () => { const l = document.createElement('link'); l.setAttribute('rel', 'canonical'); return l; }, { href: url }),
      metaProp('og:type', type),
      metaProp('og:site_name', SITE_NAME),
      metaProp('og:locale', 'en_IN'),
      metaProp('og:title', fullTitle),
      metaProp('og:description', desc),
      metaProp('og:url', url),
      metaProp('og:image', image),
      metaName('twitter:card', 'summary_large_image'),
      metaName('twitter:title', fullTitle),
      metaName('twitter:description', desc),
      metaName('twitter:image', image),
    ];

    // Structured data (JSON-LD)
    let ldEl = null;
    if (jsonLdString) {
      ldEl = document.createElement('script');
      ldEl.type = 'application/ld+json';
      ldEl.setAttribute('data-seo', 'page');
      ldEl.textContent = jsonLdString;
      document.head.appendChild(ldEl);
    }

    return () => {
      document.title = prevTitle;
      undo.forEach((fn) => fn());
      if (ldEl) ldEl.remove();
    };
  }, [title, description, path, image, type, noindex, jsonLdString]);

  return null;
}