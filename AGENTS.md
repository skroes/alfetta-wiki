# AGENTS.md — repo/alfetta-wiki

> Review-regels voor Codex (lokale T2 + GitHub cloud PR-reviews).
> Live: https://alfetta-wiki.vercel.app (noindex private wiki).
> Werkinstructies voor AI-agents staan in CLAUDE.md / README.md.

## Scope / wanneer actief

**Actief op:** `pages/` (MDX content), `components/`, `public/figures/`, `public/pages/`, Nextra-config.

**PASS zonder inhoudelijke check:** `next.config`, `package.json`, deploy-config-only.

## BRONREGEL — de kernregel voor deze repo

Alle inhoud komt **uitsluitend** uit `skroes/alfetta-project` (staging/*.md, pdfs/, figuren). Geen training-data, geen algemene motor-kennis, geen aannames.

## Harde regels (FAIL)

1. **Feitelijke claim zonder `<Cite p="N" />`** in `.mdx` body — bronregel geschonden.
2. **Meetwaarden / specs** in body zonder bron-match — **gevaar voor monteurs**.
3. **"typisch", "meestal", "bekend dat", "over het algemeen"** in content — training-data-lek.
4. **API routes toegevoegd** (`pages/api/`) — site is puur statisch, mag niet.
5. **`noindex, nofollow` meta weggehaald** uit `_app.tsx` of `theme.config.tsx`.
6. **Secrets in code** — API keys, tokens, credentials.
7. **Top-level `{/* JSX comment */}` in MDX** — breekt Nextra 3 build.

## Aandacht (MAJOR / MINOR)

- **`<SourceRef>` / `<Figure>` / `<PageScan>` verwijzen naar niet-bestaand bestand** — MAJOR (broken image/link)
- **Frontmatter `source.doc` + `source.pages` ontbreekt** — MINOR
- **Jargon-blok EN→NL ontbreekt** bij Engelse bron — NIT
- **`figures-index.json` niet regenererd** na nieuwe crops — NIT
- **Caption te lang of niet-Nederlands** — NIT

## Known tradeoffs — SKIP

- TL;DR-samenvatting met Cite aan einde (geen Cite per zin)
- Jargon-tabel zonder Cite per rij (vertalingen, geen claim)
- Import-statements bovenaan (technische setup)
- PDFs binary in git (bewust, .gitattributes)
- Frontmatter-velden (description/tags) zonder Cite

## Niet flaggen

- Markdown-stijl variaties in ondersteunende docs
- Hardgecodeerde DOC-XX referenties in componenten die voor die DOC zijn gemaakt
- Nextra 3 quirks (build-specifiek)
