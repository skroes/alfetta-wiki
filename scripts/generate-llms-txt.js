#!/usr/bin/env node

/**
 * generate-llms-txt.js
 *
 * Scant pages/ directory, leest MDX frontmatter en _meta.ts bestanden,
 * en genereert public/llms.txt conform de llmstxt.org specificatie.
 *
 * Site-eigen index voor de alfetta-wiki publicatie-laag. Deze is los van de
 * project-root llms.txt in skroes/alfetta-project, die de werkrepo-structuur
 * beschrijft.
 */

const fs = require('fs')
const path = require('path')

const PAGES_DIR = path.join(__dirname, '../pages')
const OUTPUT_PATH = path.join(__dirname, '../public/llms.txt')
const BASE_URL = process.env.ALFETTA_WIKI_BASE_URL || 'https://alfetta-wiki.vercel.app'

const SITE_TITLE = 'Alfetta Archief'
const SITE_DESCRIPTION =
  "Privé archief voor Serge's 1977 Alfa Romeo Alfetta 2.0 Serie 2. " +
  'Alle inhoud letterlijk uit door Serge aangeleverde bronnen — geen training-data, ' +
  'geen AI-hallucinatie. Elke claim heeft een DOC-code en pagina-referentie.'

// Pagina's die we skippen in llms.txt
const SKIP_PAGES = new Set([
  'index' // Homepage is apart behandeld
])

/**
 * Parse YAML-achtige frontmatter uit MDX bestand.
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return {}

  const fm = {}
  const lines = match[1].split('\n')

  for (const line of lines) {
    const kvMatch = line.match(/^(\w[\w-]*):\s*(.*)/)
    if (kvMatch) {
      const key = kvMatch[1]
      let value = kvMatch[2].trim()
      if (
        (value.startsWith("'") && value.endsWith("'")) ||
        (value.startsWith('"') && value.endsWith('"'))
      ) {
        value = value.slice(1, -1)
      }
      fm[key] = value
    }
  }

  return fm
}

/**
 * Parse _meta.ts bestand en return key-value mapping.
 */
function parseMetaFile(filePath) {
  if (!fs.existsSync(filePath)) return {}

  const content = fs.readFileSync(filePath, 'utf-8')
  const entries = {}

  const regex =
    /['"]?([\w-]+)['"]?\s*:\s*(?:'([^']*)'|"([^"]*)"|\{[^}]*display:\s*['"]hidden['"][^}]*\}|(\{[\s\S]*?\}))/g
  let match

  while ((match = regex.exec(content)) !== null) {
    const key = match[1]
    const value = match[2] || match[3]
    if (value) {
      entries[key] = value
    } else {
      entries[key] = { hidden: true }
    }
  }

  return entries
}

/**
 * Scan een sectie-directory voor MDX bestanden en return pagina-informatie.
 */
function scanSection(sectionDir, sectionSlug) {
  const metaPath = path.join(sectionDir, '_meta.ts')
  const meta = parseMetaFile(metaPath)
  const pages = []
  const seen = new Set()

  // Eerst: pagina's uit _meta.ts (behoudt volgorde)
  for (const [slug, title] of Object.entries(meta)) {
    if (slug === 'index') continue
    if (typeof title !== 'string') {
      seen.add(slug)
      continue
    }

    const mdxPath = path.join(sectionDir, `${slug}.mdx`)
    if (!fs.existsSync(mdxPath)) continue

    seen.add(slug)
    const content = fs.readFileSync(mdxPath, 'utf-8')
    const fm = parseFrontmatter(content)
    const description = fm.description && fm.description !== title ? fm.description : ''
    const url = `${BASE_URL}/${sectionSlug}/${slug}`
    pages.push({ title, url, description })
  }

  // Daarna: MDX bestanden die niet in _meta.ts staan (filesystem discovery)
  if (fs.existsSync(sectionDir) && fs.statSync(sectionDir).isDirectory()) {
    const files = fs.readdirSync(sectionDir).filter((f) => f.endsWith('.mdx'))
    for (const file of files) {
      const slug = file.replace('.mdx', '')
      if (seen.has(slug) || slug === 'index') continue

      const mdxPath = path.join(sectionDir, file)
      const content = fs.readFileSync(mdxPath, 'utf-8')
      const fm = parseFrontmatter(content)
      const title =
        fm.title ||
        slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      const description =
        fm.description && fm.description !== title ? fm.description : ''
      const url = `${BASE_URL}/${sectionSlug}/${slug}`
      pages.push({ title, url, description })
    }
  }

  return pages
}

/**
 * Genereer llms.txt content.
 */
function generateLlmsTxt() {
  const rootMeta = parseMetaFile(path.join(PAGES_DIR, '_meta.ts'))
  const lines = []

  lines.push(`# ${SITE_TITLE}`)
  lines.push('')
  lines.push(`> ${SITE_DESCRIPTION}`)
  lines.push('')
  lines.push(
    'Nederlandstalige wiki gebaseerd op originele Alfa Romeo fabriek-workshop-handboeken (DOC-04 Engine, DOC-05 Transmissie, DOC-06 Inspection Specs), aangevuld met RDW-registergegevens en eigen documentatie. Gestart april 2026. De wiki volgt een strikte bronregel: elke inhoudelijke claim verwijst naar een pagina in een van de DOC-PDFs. Voor volledige content zie `/llms-full.txt`.'
  )
  lines.push('')

  // Start pagina
  const indexPath = path.join(PAGES_DIR, 'index.mdx')
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf-8')
    const fm = parseFrontmatter(content)
    lines.push('## Start')
    lines.push('')
    lines.push(
      `- [${fm.title || 'Alfetta Archief'}](${BASE_URL}/)${
        fm.description ? ': ' + fm.description : ''
      }`
    )
    lines.push('')
  }

  // Secties
  for (const [slug, value] of Object.entries(rootMeta)) {
    if (SKIP_PAGES.has(slug)) continue
    if (typeof value !== 'string') continue

    const sectionTitle = value
    const sectionDir = path.join(PAGES_DIR, slug)

    if (!fs.existsSync(sectionDir) || !fs.statSync(sectionDir).isDirectory()) {
      continue
    }

    lines.push(`## ${sectionTitle}`)
    lines.push('')

    const pages = scanSection(sectionDir, slug)
    for (const page of pages) {
      lines.push(
        `- [${page.title}](${page.url})${
          page.description ? ': ' + page.description : ''
        }`
      )
    }
    lines.push('')
  }

  // Pointers naar machine-readable resources voor LLM-clients.
  // Conform llmstxt.org: "Optional" voor secundaire links die overgeslagen mogen worden.
  lines.push('## Optional')
  lines.push('')
  lines.push(
    `- [llms-full.txt](${BASE_URL}/llms-full.txt): Volledige content-dump van alle gevalideerde pagina's, geconcateneerd in sitemap-volgorde — direct geschikt voor LLM-context.`
  )
  lines.push(
    `- [sitemap.xml](${BASE_URL}/sitemap.xml): XML-sitemap met alle URL's, lastmod en priority — voor crawlers en RAG-pipelines.`
  )
  lines.push('')

  return lines.join('\n')
}

const publicDir = path.dirname(OUTPUT_PATH)
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true })
}

const output = generateLlmsTxt()
fs.writeFileSync(OUTPUT_PATH, output)

const lineCount = output.split('\n').length
const pageCount = (output.match(/^- \[/gm) || []).length
console.log(`Generated llms.txt: ${pageCount} pages, ${lineCount} lines`)
