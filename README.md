# Pont Atlas

App canonique : https://pont-atlas.netlify.app/

**Attention :** l'état GitHub `main` n'est pas encore le bundle Netlify complet (`app.js` / vrai `engine.js`). L'app téléphone persiste via `localStorage` clé `pont-atlas:params:v1`.

`index.html` à la racine est l'ancienne UI monofichier (moteur simplifié, sans vente/épargne/voiture DH/Ethias/pension conformes au vrai moteur Netlify). Une copie figée avant modification est conservée dans `archive/index.legacy.html`. En attendant le vrai `app.js`/`engine.js`, ce fichier a été complété avec :

- persistance `localStorage` sous la clé exacte `pont-atlas:params:v1` (mêmes ids `#p-*`)
- bouton **Exporter JSON** (téléchargement + copie presse-papiers) : dump `{ app, version, exportedAt, storageKey, params, kpis }`
- bouton **Importer JSON** : relit un export du même format, réapplique les champs et re-render
- les 15 valeurs par défaut confirmées du plan téléphone (`confirmedFromScreens`, hors `nomPhase1`/`nomPhase2` qui n'ont pas de champ correspondant dans ce moteur) ont été mergées dans les `value=""` par défaut

Les champs vente/épargne/voiture DH/pension/Ethias restent ceux de l'ancien moteur — **non vérifiés**, ne pas les considérer comme fiables.

Plan téléphone : `pont-atlas-plan-telephone.json`
Brief Claude : `PONT-ATLAS-CLAUDE.md`
Instructions de reconstruction : `RECONSTRUCT.md`
