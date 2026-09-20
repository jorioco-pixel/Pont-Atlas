# Bundle Netlify

Le vrai code (app.js + engine.js + index.html v7, bouton Exporter) est découpé ici.

Quand tous les `.txt` sont présents :

```
sh bundle/assemble.sh
git add app.js engine.js index.html
git commit -m "Install Netlify bundle"
```

Ne pas lier Netlify avant ce commit.
