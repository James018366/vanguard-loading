# Loading screen — Clone Wars Vanguard

Écran de chargement pour Garry's Mod, prêt pour **GitHub Pages**.

## Mise en ligne (5 minutes)
1. Crée un dépôt GitHub public (ex : `cwv-loading`) et envoie-y **tous** ces fichiers (dossier `assets` compris).
2. Dans le dépôt : **Settings → Pages → Branch : `main` / `(root)` → Save**.
3. Après 1 à 2 minutes, ta page est en ligne : `https://TON-PSEUDO.github.io/cwv-loading/`
4. Dans le `server.cfg` de ton serveur :
   ```
   sv_loadingurl "https://TON-PSEUDO.github.io/cwv-loading/?steamid=%s&map=%m"
   ```
5. Redémarre le serveur.

## Personnaliser
Tout se règle dans **`config.js`** : nom, slogan, lien Discord, astuces, actualités HoloNet, musique.
Le logo est `assets/logo.png` (PNG transparent, carré).

## Bon à savoir
- Ouverte dans un navigateur normal, la page lance une **démo** de chargement (pratique pour la voir sur GitHub).
- Compatible avec l'ancien navigateur de GMod (branche principale) et le nouveau (x86-64) : JavaScript ES5, pas de variables CSS.
- Musique : mets un lien **direct** vers un `.mp3` / `.ogg` dans `config.js` (pas un lien YouTube). Le volume suit celui du jeu.
