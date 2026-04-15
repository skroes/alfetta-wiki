import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <span style={{ fontWeight: 600 }}>Alfetta Archief</span>,
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
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta
        name="description"
        content="Privé archief voor Serge's 1977 Alfa Romeo Alfetta 2.0 Serie 2"
      />
      <meta name="robots" content="noindex, nofollow" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    </>
  ),
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
