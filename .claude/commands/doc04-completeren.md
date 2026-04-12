# DOC-04 completeren — resterende pagina's vertalen

Vertaal de resterende DOC-04 pagina's naar MDX voor de alfetta-wiki. Volg exact dezelfde methode als de bestaande 13 motorpagina's.

## Context

- Wiki: `/Users/serkroes/wd-workspace/repo/alfetta-wiki/`
- Staging: `/Users/serkroes/wd-workspace/airflow/projects/alfetta-project/staging/DOC-04/pages/`
- Bestaande pagina's als voorbeeld: `pages/motor/*.mdx` (13 stuks)
- SELECTIE.md met prioriteiten: `/Users/serkroes/wd-workspace/airflow/projects/alfetta-project/content/doc-04/SELECTIE.md`

## Wat te doen

### Prioriteit 1: Blok B — p20-21 (cilinderkop toleranties)
- Lees staging/DOC-04/pages/020.md en 021.md
- Maak 1 MDX: `pages/motor/cilinderkop-demonteren-toleranties.mdx`
- Vult het bestaande cilinderkop-revisie.mdx (p29-30) aan
- Alle meetwaarden letterlijk overnemen met Cite

### Prioriteit 2: Blok C — p23-27 (krukas/zuigers + distributieketting)
- Lees staging/DOC-04/pages/023.md t/m 027.md
- Maak 2 MDX: `pages/motor/krukas-zuigers-herbouwen.mdx` (p23-26) + `pages/motor/distributieketting.mdx` (p27)
- Machine-shop werk, maar meetwaarden zijn cruciaal

### Prioriteit 3: Blok A — p13-19 (motordemontage werkbank)
- Lees staging/DOC-04/pages/013.md t/m 019.md
- Maak 1-2 MDX: `pages/motor/motor-demonteren-werkbank.mdx`
- 7 pagina's — groot volume, specialist-werk

### Prioriteit 4: Blok D — p32 (motor terugplaatsen)
- Lees staging/DOC-04/pages/032.md
- Maak 1 MDX: `pages/motor/motor-terugplaatsen.mdx`
- Inverse van motor-uitbouwen, 1 pagina

## Werkwijze per pagina

1. Lees de staging markdown (OCR output)
2. Vergelijk visueel met de PDF scan als de OCR onduidelijk is: `pdftoppm -jpeg -r 150 -f N -l N "/Users/serkroes/wd-workspace/airflow/projects/alfetta-project/pdfs/workshop-manuals/Alfetta Workshop Manual - Engine (2448, april 1977).pdf" /tmp/doc04_pN`
3. Vertaal naar Nederlands met actieve zinnen, je-vorm
4. Frontmatter: kopieer structuur van bestaande pagina's (source.doc: DOC-04, pages: alle gebruikte pagina's)
5. Elke feitelijke claim krijgt een Cite verwijzing
6. Figuren: check `public/figures/doc-04/figures-index.json` voor beschikbare figuren, gebruik Figure component
7. SourceRef component onderaan
8. Jargon-tabel EN/NL onderaan
9. Status: `validated` als visueel geverifieerd tegen scan

## Regels

- ALLEEN content uit de staging markdown / PDF scans
- GEEN training data voor inhoud
- Meetwaarden LETTERLIJK overnemen (geen conversies tenzij in bron)
- source.pages = ALLE pagina's die geciteerd worden (volledige provenance)
- Build moet slagen: `pnpm build`
- Validator moet slagen: `./scripts/validate-sources.sh`

## Na afloop

- Update `_meta.ts` in `pages/motor/` met nieuwe pagina's
- Update `pages/bronnen.mdx` tabel met nieuwe pagina-regels
- Update `content/doc-04/SELECTIE.md` statussen
- Commit met: `feat: DOC-04 {blok} — {onderwerp} vertaald`
