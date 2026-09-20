#!/bin/sh
set -e
cd "$(dirname "$0")/.."
for name in engine.js app.js index.html; do
  list="bundle/${name}.list"
  [ -f "$list" ] || continue
  : > "$name"
  while IFS= read -r part; do
    cat "bundle/$part" >> "$name"
  done < "$list"
  echo "wrote $name ($(wc -c < "$name") bytes)"
done
