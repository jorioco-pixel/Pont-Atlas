# Reconstruct the live app

Claude cannot fetch Netlify. Do not invent engine.js.

Until `app.js` and a real `engine.js` land in this repo:

1. Keep `index.html` (598 lines) as `archive/index.legacy.html`.
2. Implement on the current file OR a new thin wrapper:
   - localStorage key `pont-atlas:params:v1`
   - Exporter JSON / Importer JSON
   - merge only `confirmedFromScreens` from `pont-atlas-plan-telephone.json` into defaults
3. Do not change STORAGE_KEY.
4. Do not guess vente / epargne / voitureDh / Ethias math.

Live URLs (open on a phone, paste into repo if needed):
- https://pont-atlas.netlify.app/app.js
- https://pont-atlas.netlify.app/engine.js
- https://pont-atlas.netlify.app/
