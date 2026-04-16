# Validatie-checklist

**Voor elke draft-pagina in `drafts/` — vink af voordat je hem naar `pages/` verplaatst.**

## Pre-flight (frontmatter)

- [ ] `status: validated` (niet `draft`)
- [ ] `source.doc` klopt (DOC-03 / DOC-04 / etc)
- [ ] `source.pages` bevat álle staging-paginanummers waaruit content komt
- [ ] `source.pdf` verwijst naar de juiste PDF in `/docs/`
- [ ] `source.archive_url` klopt (Google Drive link uit `/bronnen`)
- [ ] `validated_date` = vandaag
- [ ] `validated_by` = `"serge (visuele vergelijking)"` of `"/alfettaspecialist"`

## Bronregel (de harde check)

Open de bijbehorende scan(s) naast de draft en loop deze punten langs:

- [ ] **Elke `<Cite p="N" />` verwijst naar een paginanummer dat de claim daadwerkelijk ondersteunt.** Niet "ongeveer", maar letterlijk.
- [ ] **Geen getallen zonder bron.** Elk torque-koppel, elke tolerantie, elke temperatuur → `<Cite>`.
- [ ] **Geen AI-invulsels.** Als iets niet in de staging-OCR stond, staat het niet in de draft. Uitzondering: jargon-tabel mag algemene vertaling bevatten.
- [ ] **Figuren-referenties**: iedere `<Figure src="..." />` bestaat in `public/figures/doc-XX/` en toont wat de caption zegt.
- [ ] **Gereedschapsnummers** (A.x.xxxx, C.x.xxxx, R.x.xxxx) — spelling identiek aan bron, geen normaliseringen.

## Vertaling

- [ ] **Technische termen in NL** (klepspeling, cardanas, draagarm, torsiestaaf) — jargon-tabel onderaan wanneer de vertaling niet voor de hand ligt.
- [ ] **Getallen en eenheden onveranderd** — komma's, haakjes, ° ' " precies zoals in bron.
- [ ] **Richtingen dubbel gecheckt** — "linksom gezien vanaf vliegwielzijde" is makkelijk om te draaien.

## Structuur

- [ ] H1 bovenaan, beschrijvend
- [ ] TL;DR blockquote met concrete kerngetallen
- [ ] Procedure in genummerde lijst (stap 1, 2, 3, ...)
- [ ] Waarschuwingen/notes in aparte "Let op" sectie
- [ ] Jargon-tabel onderaan (EN → NL) wanneer relevant
- [ ] `SourceRef` component onderaan (niet vergeten — staat in de template)

## Integratie

- [ ] Pagina verplaatst: `drafts/foo.mdx` → `pages/<sectie>/foo.mdx`
- [ ] `_meta.ts` in de sectie-directory bijgewerkt
- [ ] `pages/bronnen.mdx` status-tabel bijgewerkt (wiki-count +1, status per DOC)
- [ ] `pages/index.mdx` tile-count bijgewerkt (Motor 18 → 19, etc)
- [ ] llms.txt regenereren: `node scripts/generate-llms-txt.js` (of gelijknamige script)

## Commit

- [ ] Commit-message in Nederlands, één pagina per commit
- [ ] Format: `feat(<doc>): <onderwerp> — p<N>` bijv. `feat(doc-03): voorwielophanging verwijderen — p24-26`
