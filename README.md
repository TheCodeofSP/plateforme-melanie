# Mise à jour du dépôt vers le bloc 1 — V3.1

Ce dossier contient uniquement les fichiers différents entre le projet GitHub transmis et `plateforme-1-V3.1`.

## 1. Remplacer et ajouter les fichiers

Copier les dossiers `apps` et `docs` à la racine du projet GitHub en conservant l’arborescence. Accepter le remplacement des fichiers existants.

Les fichiers absents du dépôt seront créés automatiquement lors de la copie, notamment :

- `apps/api/.prettierrc.json` ;
- `apps/api/docs/BLOC-1-V3.1-TECHNIQUE.md` ;
- `apps/api/src/config/auth.constants.js` ;
- `apps/api/src/services/auth/magicLink.service.js` ;
- `apps/api/test/auth.validation.test.js` ;
- `apps/web/.prettierrc.json` ;
- `apps/web/src/features/auth/pages/AccountSettingsPage.jsx` ;
- `apps/web/src/features/auth/pages/ConfirmEmailChangePage.jsx` ;
- `apps/web/src/features/auth/pages/MagicLoginPage.jsx` ;
- `apps/web/src/styles/pages/account.scss` ;
- `docs/BLOC_1_DECISIONS_MELANIE.md`.

## 2. Supprimer les anciens fichiers

La liste exhaustive se trouve dans `FICHIERS_A_SUPPRIMER.txt`.

Depuis la racine du dépôt, les suppressions peuvent être enregistrées avec :

```bash
git rm \
  apps/api/src/controllers/auth/password.controller.js \
  apps/api/src/routes/auth/password.routes.js \
  apps/api/src/services/auth/passwordChange.service.js \
  apps/api/src/services/auth/passwordRecovery.service.js \
  apps/api/src/services/password.service.js \
  apps/api/src/templates/auth/parentalAuthorization.template.js \
  apps/api/src/templates/auth/passwordReset.template.js \
  apps/api/src/validations/auth/password.validation.js \
  apps/api/src/validations/auth/shared.validation.js \
  apps/web/src/content/parental-authorization.content.js \
  apps/web/src/features/auth/components/PasswordRequirements.jsx \
  apps/web/src/features/auth/pages/ParentalAuthorizationPage.jsx
```

## 3. Réinstaller les dépendances

Les fichiers `package.json` et `package-lock.json` ont changé dans les deux applications.

```bash
cd apps/api
npm ci

cd ../web
npm ci

cd ../..
```

## 4. Contrôler la mise à jour

```bash
cd apps/api
npm run format:check
npm run lint
npm test
npm audit --omit=dev

cd ../web
npm run format:check
npm run lint
npm test
npm run build
npm audit --omit=dev

cd ../..
```

Les tests d’intégration API nécessitent une base MongoDB de test configurée dans `MONGO_TEST_URI` :

```bash
cd apps/api
npm run test:integration
```

Sans cette variable, ils sont ignorés volontairement pour protéger la base principale.

## 5. Vérifier les modifications Git

```bash
git status
git diff --stat
git diff --check
```

Les fichiers `README-MISE-A-JOUR.md` et `FICHIERS_A_SUPPRIMER.txt` servent uniquement de guide. Ils ne sont pas destinés à être copiés dans le dépôt.
