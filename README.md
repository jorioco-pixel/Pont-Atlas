# Pont Atlas

Simulation de retraite anticipée Belgique → Maroc.

- App canonique : https://pont-atlas.netlify.app/
- Repo : ce dossier (mêmes fichiers que Netlify)
- Params locaux : `localStorage` clé `pont-atlas:params:v1` (par appareil)

## Fichiers

- `index.html` — UI
- `app.js` — interface, export JSON, PWA install
- `engine.js` — moteur
- `manifest.json` + icônes — install écran d’accueil

## Export

Paramètres → **Exporter JSON** : télécharge le plan et le copie dans le presse-papiers.
