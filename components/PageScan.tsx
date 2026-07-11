import Figure from './Figure'

/**
 * PageScan — toont een volledige 300 DPI page-scan uit een DOC.
 *
 * Dunne wrapper rond <Figure> die de page-scan-conventie vastlegt:
 *   /pages/{DOC}/{NNN}.jpg  (geproduceerd door scripts/copy-page-scans.sh)
 *
 * Koppelt via `figureId` aan `content/{doc}/figures.json` voor LLM-retrieval
 * (zie alfetta-project/prds/prd269-figures-placement.md).
 *
 * Props:
 *   doc       — "DOC-04", "DOC-05", ...
 *   page      — 1-based pagina-nummer in de bron-PDF
 *   caption   — menselijke uitleg (NL). Bij voorkeur uit figures.json.
 *   figureId  — optioneel; machine-leesbare koppeling met figures.json
 *   size      — "md" | "lg" | "full" (default "lg" — pagina-scan is groot)
 */
type PageScanProps = {
  doc: string
  page: number
  caption?: string
  figureId?: string
  size?: 'md' | 'lg' | 'full'
}

export default function PageScan({ doc, page, caption, figureId, size = 'lg' }: PageScanProps) {
  const paddedPage = String(page).padStart(3, '0')
  const src = `/pages/${doc}/${paddedPage}.jpg`
  const alt = caption ?? `${doc} pagina ${page} — originele scan`

  return (
    <div data-figure-id={figureId} data-doc={doc} data-page={page}>
      <Figure src={src} caption={caption} alt={alt} page={page} doc={doc} size={size} />
    </div>
  )
}
