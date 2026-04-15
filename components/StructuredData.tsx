import React from 'react'

/**
 * StructuredData — schema.org Article + BreadcrumbList JSON-LD.
 *
 * Wordt gerenderd in `theme.config.tsx` head() per page. Leest frontmatter
 * (validated_date / drafted_on) voor datePublished/dateModified.
 *
 * BreadcrumbList wordt afgeleid uit het pad: /motor/contactpunten-afstellen
 *   → Home › Motor › Contactpunten Afstellen
 */

const SITE_URL = 'https://alfetta-wiki.vercel.app'
const PUBLISHER_NAME = 'Alfetta Archief'
const AUTHOR_NAME = 'Serge Kroes'

type FrontMatter = {
  title?: string
  description?: string
  validated_date?: string
  drafted_on?: string
  last_updated?: string
}

type Props = {
  frontMatter?: FrontMatter
  title: string
  description: string
  url: string
  path: string
}

function humanizeSegment(seg: string): string {
  return seg
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function buildBreadcrumbs(path: string) {
  const segments = path.split('/').filter(Boolean)
  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: SITE_URL + '/'
    }
  ]
  let acc = ''
  segments.forEach((seg, idx) => {
    acc += '/' + seg
    items.push({
      '@type': 'ListItem',
      position: idx + 2,
      name: humanizeSegment(seg),
      item: SITE_URL + acc
    })
  })
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items
  }
}

function buildArticle(props: Props) {
  const fm = props.frontMatter || {}
  const datePublished = fm.validated_date || fm.drafted_on || undefined
  const dateModified =
    fm.last_updated || fm.validated_date || fm.drafted_on || undefined

  const article: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: props.title,
    description: props.description,
    url: props.url,
    inLanguage: 'nl-NL',
    author: { '@type': 'Person', name: AUTHOR_NAME },
    publisher: {
      '@type': 'Organization',
      name: PUBLISHER_NAME
    }
  }
  if (datePublished) article.datePublished = datePublished
  if (dateModified) article.dateModified = dateModified
  return article
}

export default function StructuredData(props: Props) {
  // Geen JSON-LD op de homepage (pad '/'): alleen Article+Breadcrumbs op
  // content-pages voorkomt rare "Home" als enige breadcrumb-item.
  if (props.path === '/' || props.path === '') {
    return null
  }

  const article = buildArticle(props)
  const breadcrumbs = buildBreadcrumbs(props.path)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
    </>
  )
}
