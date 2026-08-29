const NOINDEX_PATTERNS = [/\/trenazher\/sessiya\//, /\/probniki\/[^/]+\//, /\/moy-progress\//, /\/poisk\//];

/** Служебные разделы, закрытые от индексации (держать в синхроне с astro.config.mjs). */
export function isNoindexPath(pathname: string): boolean {
  return NOINDEX_PATTERNS.some((re) => re.test(pathname));
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function breadcrumbListJsonLd(items: BreadcrumbItem[], siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: new URL(item.url, siteUrl).toString(),
    })),
  };
}

export function articleJsonLd(opts: {
  title: string;
  description: string;
  url: string;
  siteUrl: string;
  datePublished: string;
  dateModified: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    url: new URL(opts.url, opts.siteUrl).toString(),
    datePublished: opts.datePublished,
    dateModified: opts.dateModified,
    author: { '@type': 'Organization', name: 'ОГЭ Химия' },
    publisher: { '@type': 'Organization', name: 'ОГЭ Химия' },
  };
}

export function faqPageJsonLd(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

export function learningResourceJsonLd(opts: { title: string; description: string; url: string; siteUrl: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: opts.title,
    description: opts.description,
    url: new URL(opts.url, opts.siteUrl).toString(),
    learningResourceType: 'Учебный материал',
    educationalLevel: '9 класс',
    about: { '@type': 'Thing', name: 'Химия, ОГЭ' },
  };
}

export function websiteJsonLd(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ОГЭ Химия',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}poisk/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}
