import React from 'react'
import { DocsThemeConfig, useConfig } from 'nextra-theme-docs'
import { useRouter } from 'next/router'
import StructuredData from './components/StructuredData'

const SITE_URL = 'https://alfetta-wiki.vercel.app'
const SITE_NAME = 'Alfetta Archief'
const DEFAULT_DESCRIPTION =
  "Privé archief voor Serge's 1977 Alfa Romeo Alfetta 2.0 Serie 2"
const DEFAULT_OG_IMAGE = `${SITE_URL}/favicon.svg`

const config: DocsThemeConfig = {
  logo: (
    <span className="af-logo">
      <img src="/favicon.svg" alt="" width={22} height={22} />
      <span>
        Alfetta <span className="af-logo-accent">Archief</span>
      </span>
    </span>
  ),
  project: {
    link: 'https://github.com/skroes/alfetta-wiki'
  },
  docsRepositoryBase: 'https://github.com/skroes/alfetta-wiki/tree/main',
  footer: {
    content: (
      <span style={{ fontSize: '0.85rem' }}>
        Privé archief — bron: Serge Kroes. Alle inhoud komt letterlijk uit door
        Serge aangeleverde bronnen. Geen training-data, geen AI-hallucinatie.
      </span>
    )
  },
  head: function Head() {
    const { frontMatter, title } = useConfig()
    const { asPath } = useRouter()
    const url = `${SITE_URL}${asPath === '/' ? '' : asPath}`
    const description =
      (frontMatter as any)?.description || DEFAULT_DESCRIPTION
    const isHome = asPath === '/' || asPath === ''
    const ogTitle = isHome
      ? SITE_NAME
      : title
        ? `${title} — ${SITE_NAME}`
        : SITE_NAME
    const ogImage = (frontMatter as any)?.ogImage || DEFAULT_OG_IMAGE

    return (
      <>
        <title>{ogTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content={description} />
        <meta name="robots" content="noindex, nofollow" />
        <meta name="theme-color" content="#cc0000" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="canonical" href={url} />

        {/* Open Graph */}
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:type" content="article" />
        <meta property="og:locale" content="nl_NL" />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={ogImage} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />

        {/* Schema.org Article JSON-LD */}
        <StructuredData
          frontMatter={frontMatter as any}
          title={ogTitle}
          description={description}
          url={url}
          path={asPath}
        />
      </>
    )
  },
  sidebar: {
    defaultMenuCollapseLevel: 1
  },
  feedback: {
    content: null
  },
  editLink: {
    content: null
  },
  darkMode: true,
  nextThemes: {
    defaultTheme: 'system'
  }
}

export default config
