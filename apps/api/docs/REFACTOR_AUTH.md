# Refactor de l’authentification

## Objectif

Rendre le bloc comptes/authentification maintenable sans modifier les routes, les réponses HTTP ou les règles métier déjà validées.

## Nouvelle organisation

- `src/templates/auth/` : un fichier par email et une fonction commune d’échappement HTML ;
- `src/validations/auth/` : schémas regroupés par parcours ;
- `src/routes/auth/` : routes regroupées par parcours ;
- `src/controllers/auth/` : contrôleurs regroupés par responsabilité ;
- `src/services/auth/` : inscription, activation, connexion, sessions, mots de passe, profil, changement d’email et suppression séparés.

Les anciens fichiers `auth.service.js`, `auth.controller.js`, `auth.validation.js`, `auth.routes.js` et `authEmail.templates.js` sont conservés comme points d’entrée de compatibilité. Ils ne contiennent désormais qu’un export vers la nouvelle organisation. Les imports existants restent donc valides.

## Contrôles réalisés

- vérification de syntaxe de tous les fichiers JavaScript avec `node --check` ;
- résolution statique de tous les imports relatifs des 91 fichiers JavaScript ;
- vérification manuelle du maintien des méthodes et URL publiques ;
- absence de `.env`, de clés API et de secrets dans le livrable ;
- exclusion de `node_modules` et des fichiers système macOS.

## Vérification locale recommandée après remplacement

Depuis `apps/api`, avec le fichier `.env` local conservé :

```bash
npm install
npm run dev
```

Le résultat attendu est :

```text
✅ MongoDB connecté
🚀 Serveur lancé sur le port 5100
```

Tester ensuite au minimum :

```bash
curl http://localhost:5100/api/health
```

Les tests fonctionnels déjà réalisés avant le refactor couvrent les parcours du bloc. Une suite automatisée reste recommandée dans un prochain chantier technique.

