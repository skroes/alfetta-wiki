#!/bin/bash
# validate-sources.sh — Bronregel validator MVP
# Checkt of elke MDX-pagina de minimale bronregel-vereisten heeft.
# Draai als prebuild check of handmatig na het toevoegen van nieuwe pagina's.
#
# Exit code 0 = alle checks geslaagd
# Exit code 1 = minstens één check gefaald

set -euo pipefail

WIKI_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PAGES_DIR="$WIKI_ROOT/pages"
ERRORS=0
WARNINGS=0
CHECKED=0

red() { printf '\033[0;31m%s\033[0m\n' "$1"; }
yellow() { printf '\033[0;33m%s\033[0m\n' "$1"; }
green() { printf '\033[0;32m%s\033[0m\n' "$1"; }

# Zoek alle .mdx bestanden (skip _meta.ts, _app.tsx, governance/)
while IFS= read -r file; do
    rel="${file#$PAGES_DIR/}"

    # Skip governance pagina's en index
    if [[ "$rel" == governance/* ]] || [[ "$rel" == "index.mdx" ]]; then
        continue
    fi

    CHECKED=$((CHECKED + 1))
    file_errors=0

    # Check 1: frontmatter heeft source.doc
    if ! grep -q '^  doc:' "$file" 2>/dev/null; then
        red "FAIL  $rel — ontbreekt: source.doc in frontmatter"
        file_errors=$((file_errors + 1))
    fi

    # Check 2: frontmatter heeft source.pages
    if ! grep -q '^  pages:' "$file" 2>/dev/null; then
        red "FAIL  $rel — ontbreekt: source.pages in frontmatter"
        file_errors=$((file_errors + 1))
    fi

    # Check 3: minstens één <Cite in de body
    if ! grep -q '<Cite' "$file" 2>/dev/null; then
        red "FAIL  $rel — geen <Cite> gevonden — bronregel vereist minstens 1 citaat"
        file_errors=$((file_errors + 1))
    fi

    # Check 4: <SourceRef blok aanwezig
    if ! grep -q '<SourceRef' "$file" 2>/dev/null; then
        red "FAIL  $rel — geen <SourceRef> blok — bronverwijzing onderaan verplicht"
        file_errors=$((file_errors + 1))
    fi

    # Check 5: status field aanwezig
    if ! grep -q '^status:' "$file" 2>/dev/null; then
        yellow "WARN  $rel — geen status: in frontmatter"
        WARNINGS=$((WARNINGS + 1))
    fi

    # Check 6: import statement voor SourceRef/Cite
    if ! grep -q "import.*SourceRef\|import.*Cite" "$file" 2>/dev/null; then
        red "FAIL  $rel — ontbreekt: import { SourceRef, Cite }"
        file_errors=$((file_errors + 1))
    fi

    if [ $file_errors -eq 0 ]; then
        green "PASS  $rel"
    else
        ERRORS=$((ERRORS + file_errors))
    fi

done < <(find "$PAGES_DIR" -name '*.mdx' -not -path '*/_*' | sort)

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Bronregel validator — resultaat"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Gecontroleerd: $CHECKED pagina('s)"
echo "Fouten:        $ERRORS"
echo "Waarschuwingen: $WARNINGS"
echo ""

if [ $ERRORS -gt 0 ]; then
    red "FAIL — $ERRORS bronregel-schending(en) gevonden"
    exit 1
else
    green "PASS — alle content-pagina's voldoen aan de bronregel"
    exit 0
fi
