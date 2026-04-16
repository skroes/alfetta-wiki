# Drafts workspace

Werkmap voor nog-niet-gevalideerde wiki-pagina's.

## Hoe werkt het

1. Draft wordt hier geplaatst (door Claude of handmatig) met `status: draft` in frontmatter.
2. Serge valideert de draft volgens `VALIDATIE.md` — scan(s) erbij, elke `<Cite>` checken.
3. Na validatie: `status: validated`, datum invullen, `git mv` naar `pages/<sectie>/`.
4. Integratie-stappen uit `VALIDATIE.md` volgen (bronnen.mdx, index.mdx, _meta.ts, llms.txt).

## Bestanden in deze map

- `_template-procedure.mdx` — voor hoe-doe-je-dit pagina's (stappenplannen)
- `_template-specs.mdx` — voor specificatie-pagina's (tabellen met waarden)
- `DOC-XX-chapter-index.md` — hoofdstuk-index per bron, met mapping staging-pagina → beoogde wiki-pagina
- `DOC-XX-<onderwerp>.mdx` — concrete draft-pagina's

**Alles met `_` prefix** zijn templates (niet publiceren).

## Na validatie

Drafts verdwijnen uit deze map zodra ze gevalideerd zijn en naar `pages/` gemoved zijn.
Een lege `drafts/` is het eindstadium.

## Niet in build

Nextra picks up alleen `pages/`. Bestanden hier worden niet door Next gerenderd.
