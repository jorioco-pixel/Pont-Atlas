# Pont Atlas

Simulation retraite anticipée Belgique → Maroc.

**App téléphone (canonique)** : https://pont-atlas.netlify.app/

Persistance : `localStorage` clé `pont-atlas:params:v1`.

## Repo `main` (août/sept. 2026)

Mêmes fichiers que Netlify :

- `index.html` — shell v7
- `app.js` — UI + bouton **Exporter JSON**
- `engine.js` — moteur PontSim
- `manifest.json`, `favicon.svg`

Ancienne UI monofichier : `archive/index.legacy.html`.

Plan téléphone observé : `pont-atlas-plan-telephone.json`.

## Important

- Ne pas lier Netlify à ce repo sans accord : un déploiement publie le bouton Exporter sur le téléphone mais ne doit pas reset le storage.
- GitHub Pages peut rester en cache sur l’ancienne UI.
- Le plan 217 k€ est sur le téléphone seulement.
