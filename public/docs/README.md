# public/docs — gehoste bron-PDFs

Deze map bevat de originele workshop-manual PDFs die door `<SourceRef>` blokken op de wiki worden aangelinkt. Ze staan hier zodat `#page=N` deep-links werken in de native browser PDF-viewer — Google Drive's viewer negeert die parameter, dus de canonical Drive-URL blijft in de frontmatter als `archive_url` (herkomst-metadata), maar de klikbare link wijst naar deze locatie.

## Waarom publiek

De wiki is een **privé archief** in de zin dat ze `noindex, nofollow` is en niet actief wordt gedeeld — maar ze draait op `alfetta-wiki.vercel.app` en is bereikbaar voor iedereen die het adres weet. De PDFs waren via Google Drive al "anyone with the link can view" (anders werkten de `<SourceRef>` blokken ook niet voor Serge vanuit andere devices). Het pad van de hosting verandert dus niet het publieke karakter.

Wat **niet** in deze map hoort:
- Persoonlijke documenten (kenteken-papieren, eigendom, verzekering) — die horen überhaupt niet in git, ook niet in `internal/` tiers
- Afgeleide PDFs uit training data of LLM-generatie — bronregel-schending

## Naamconventie

```
DOC-NN-{korte-identifier}.pdf
```

Voorbeeld: `DOC-04-engine.pdf` voor Alfetta Workshop Manual — Engine (publ. 2448, april 1977).

Dezelfde DOC-code zoals in het werkrepo `skroes/alfetta-project` (`INDEX.md`, `scripts/stage-pdf.sh`).

## Beslissing over hosting-strategie

Walking-skeleton hosting is **direct-in-git** (`DECISIONS.md` B-11 in het werkrepo). Voor PRD-B content-scale (DOC-03..07 samen ~150 MB) wordt opnieuw bekeken of git-lfs de betere keuze wordt. Tot die beslissing: nieuwe PDFs toevoegen mag, maar geen herhaaldelijke re-commits van dezelfde file — dan groeit de history onnodig.
