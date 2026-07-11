#!/usr/bin/env bash
# generate-llms-full.sh — concateneer alle status: validated MDX-pages tot
# één tekst-dump in public/llms-full.txt voor LLM-consumptie.
#
# Aanpak:
#   1. Lees URL-volgorde uit public/sitemap.xml (gegenereerd door next-sitemap).
#   2. Voor elke URL: map terug naar pages/<path>.mdx.
#   3. Lees frontmatter (title) + body, strip JSX-imports/components.
#   4. Skip files zonder `status: validated` in frontmatter.
#   5. Output: public/llms-full.txt met header per pagina.
#
# Run: ./scripts/generate-llms-full.sh
# Of via npm: na next-sitemap (postbuild).

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PAGES_DIR="$ROOT/pages"
SITEMAP="$ROOT/public/sitemap.xml"
OUT="$ROOT/public/llms-full.txt"
SITE_URL="https://alfetta-wiki.vercel.app"

if [ ! -f "$SITEMAP" ]; then
  echo "ERROR: $SITEMAP niet gevonden — draai eerst 'npm run build' (postbuild genereert sitemap)" >&2
  exit 1
fi

# Verzamel alle URLs uit sitemap in volgorde. Here-string i.p.v. process
# substitution: Vercel's build-container mist /dev/fd (compat blijft ook
# met bash 3.2 op macOS).
URLS=()
while IFS= read -r line; do
  [ -z "$line" ] && continue
  URLS+=("$line")
done <<< "$(grep -oE '<loc>[^<]+</loc>' "$SITEMAP" | sed -E 's|</?loc>||g')"

# Output-header
{
  echo "# Alfetta Archief — volledige content-dump"
  echo ""
  echo "> Bron: ${SITE_URL}"
  echo "> Gegenereerd: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "> Bevat alleen pagina's met frontmatter status: validated."
  echo "> Voor structuur zie ${SITE_URL}/llms.txt en ${SITE_URL}/sitemap.xml"
  echo ""
  echo "---"
  echo ""
} > "$OUT"

count=0
skipped=0

strip_mdx() {
  # Strip frontmatter, JSX imports, en common JSX-componenten — houd alleen
  # markdown-tekst + Cite-references als plain tekst (p="35" → [p35]).
  local file="$1"
  awk '
    BEGIN { in_fm = 0; fm_done = 0 }
    /^---$/ {
      if (!fm_done) {
        if (in_fm == 0) { in_fm = 1; next }
        else { in_fm = 0; fm_done = 1; next }
      }
    }
    in_fm == 1 { next }
    fm_done == 0 { next }
    /^import / { next }
    { print }
  ' "$file" \
    | sed -E 's|<Cite[[:space:]]+p="([^"]+)"[[:space:]]*/>|[p\1]|g' \
    | sed -E 's|<SourceRef[^/]*/>||g' \
    | sed -E 's|<Figure[^/]*/>||g' \
    | sed -E 's|<FigureGallery[^/]*/>||g' \
    | sed -E 's|<PageScan[^/]*/>||g' \
    | sed -E 's|<[A-Za-z][A-Za-z0-9]*[^>]*>||g' \
    | sed -E 's|</[A-Za-z][A-Za-z0-9]*>||g'
}

get_title() {
  awk '
    /^---$/ { c++; next }
    c==1 && /^title:/ {
      sub(/^title:[[:space:]]*/, "")
      gsub(/^"|"$/, "")
      gsub(/^'\''|'\''$/, "")
      print
      exit
    }
  ' "$1"
}

is_validated() {
  awk '
    /^---$/ { c++; next }
    c==1 && /^status:[[:space:]]*validated/ { found=1; exit }
    END { exit !found }
  ' "$1"
}

for url in "${URLS[@]}"; do
  # Strip site-url prefix
  rel="${url#$SITE_URL}"
  rel="${rel#/}"

  # Map URL → MDX file
  if [ -z "$rel" ]; then
    file="$PAGES_DIR/index.mdx"
  else
    file="$PAGES_DIR/${rel}.mdx"
  fi

  if [ ! -f "$file" ]; then
    skipped=$((skipped + 1))
    continue
  fi

  if ! is_validated "$file"; then
    skipped=$((skipped + 1))
    continue
  fi

  title="$(get_title "$file")"
  [ -z "$title" ] && title="$rel"

  {
    echo ""
    echo "# ${title}"
    echo ""
    echo "Bron: ${url}"
    echo ""
    strip_mdx "$file"
    echo ""
    echo "---"
    echo ""
  } >> "$OUT"

  count=$((count + 1))
done

echo "Generated $OUT: $count pages (skipped $skipped non-validated/missing)"
