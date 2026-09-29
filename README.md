# Plateforme Mélanie Dizet

Plateforme web consacrée au bien-être gynécologique et à la gynécologie émotionnelle. Le projet réunit un site éditorial, des ressources, un Quiz SPM, un espace membre, La Clairière et des outils d’administration.

Le dépôt contient deux applications indépendantes :

- `apps/web` : interface React et Vite ;
- `apps/api` : API Express reliée à MongoDB.

## Fonctionnalités principales

- accueil éditorial et présentation des accompagnements ;
- authentification sans mot de passe par lien temporaire ;
- gestion du compte et des consentements ;
- catalogue de ressources publiques et réservées aux membres ;
- recommandations de ressources associées aux profils SPM ;
- Quiz SPM et envoi du résultat ;
- espace communautaire La Clairière ;
- espaces membre, intervenante et administration ;
- notifications, communications et gestion des médias.

Le projet évolue par blocs fonctionnels. Certaines fonctionnalités présentes dans le code peuvent encore être en cours de validation éditoriale ou métier.

## Prérequis

- Node.js 20 ou version ultérieure ;
- npm ;
- une base MongoDB ;
- un compte Resend pour les emails hors mode capture ;
- un compte Cloudinary pour les médias téléversés.

## Installation locale

Clonez le dépôt, puis installez les dépendances des deux applications :

```bash
cd apps/api
npm ci

cd ../web
npm ci
```

## Configuration

### API

Copiez le fichier d’exemple, puis complétez les valeurs nécessaires :

```bash
cd apps/api
cp .env.example .env
```

Les variables indispensables au démarrage local sont notamment :

- `MONGO_URI` : connexion à la base de développement ;
- `CLIENT_URL` et `ALLOWED_ORIGINS` : origine autorisée pour le front ;
- `JWT_ACCESS_SECRET` : secret de signature des sessions ;
- `EMAIL_MODE=capture` : conserve les emails en mode développement sans envoi réel.

Le fichier `.env.example` documente les autres intégrations. Aucun secret ne doit être ajouté au dépôt.

### Interface web

Créez `apps/web/.env.local` lorsque vous souhaitez remplacer les valeurs par défaut :

```dotenv
VITE_API_URL=http://localhost:5100
VITE_SITE_URL=http://localhost:5173
VITE_INSTAGRAM_URL=https://instagram.com/...
VITE_BOOKING_URL=https://...
VITE_CONTACT_LOCATION=
VITE_GA_MEASUREMENT_ID=
```

## Lancement en développement

Ouvrez deux terminaux depuis la racine du projet.

API :

```bash
cd apps/api
npm run dev
```

Interface web :

```bash
cd apps/web
npm run dev
```

Par défaut, l’interface est disponible sur `http://localhost:5173` et l’API sur `http://localhost:5100`. L’état de l’API peut être vérifié sur `http://localhost:5100/api/health`.

## Qualité et tests

### API

```bash
cd apps/api
npm run lint
npm test
npm run check:config
npm run check:contract
```

Les tests d’intégration utilisent exclusivement `MONGO_TEST_URI` :

```bash
npm run test:integration
```

### Interface web

```bash
cd apps/web
npm run lint
npm test
npm run build
npm run audit:content
```

## Données éditoriales

Les ressources éditoriales de référence se trouvent dans `apps/api/src/data/editorialResources.seed.js`.

Le script peut être exécuté d’abord en simulation, puis avec application explicite :

```bash
cd apps/api
npm run seed:editorial-resources
npm run seed:editorial-resources:apply
```

Avant toute application sur un environnement partagé, vérifiez la base ciblée et la sortie de la simulation.

## Architecture

```text
apps/
├── api/
│   ├── src/config/        Configuration et constantes
│   ├── src/controllers/   Contrôleurs HTTP
│   ├── src/models/        Modèles MongoDB
│   ├── src/routes/        Routes de l’API
│   ├── src/services/      Logique métier
│   ├── src/validations/   Schémas de validation
│   └── test/              Tests unitaires et d’intégration
└── web/
    ├── src/components/    Composants partagés
    ├── src/content/       Contenus d’interface
    ├── src/features/      Fonctionnalités métier
    ├── src/pages/         Pages publiques et privées
    ├── src/router/        Routage et protections d’accès
    └── src/styles/        Variables, mixins et styles SCSS
```

## Déploiement

Le front et l’API sont configurés séparément. En production :

- renseignez les variables d’environnement dans la plateforme d’hébergement ;
- utilisez l’URL publique de l’API dans `VITE_API_URL` ;
- autorisez l’URL publique du front dans `CLIENT_URL` et `ALLOWED_ORIGINS` ;
- activez l’envoi réel des emails uniquement après validation du domaine et des modèles ;
- exécutez les migrations et seeds nécessaires de manière contrôlée.

Les notes techniques complémentaires sont disponibles dans `docs` et `apps/api/docs`.

## Sécurité

- Ne publiez jamais de fichier `.env`, de clé API ou d’identifiant de base de données.
- Utilisez une base dédiée pour les tests automatisés.
- Vérifiez les dépendances avec `npm audit --omit=dev` dans chaque application.
- Signalez toute vulnérabilité de façon privée à la mainteneuse du projet.

## Statut du dépôt

Ce dépôt public présente le développement de la plateforme Mélanie Dizet. La publication du code ne vaut pas autorisation de réutiliser les contenus éditoriaux, textes, illustrations, photographies ou éléments de marque présents dans le projet.
