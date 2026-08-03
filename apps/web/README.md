# Plateforme Mélanie — Frontend

Application React/Vite de la plateforme de Mélanie Dizet.

## Installation

```bash
npm install
cp .env.example .env
npm run dev
```

L’API locale doit être disponible sur l’adresse déclarée dans
`VITE_API_URL`. La valeur par défaut est `http://localhost:5100`.

## Commandes

```bash
npm run dev
npm run lint
npm test
npm run test:watch
npm run build
npm run preview
```

## Fondations du bloc 1

- client Axios avec cookies `httpOnly` gérés par l’API ;
- renouvellement mutualisé des sessions expirées ;
- contexte d’authentification ;
- protections par connexion et par rôle ;
- layouts public, authentification, membre, intervenante et administration ;
- routes françaises et redirections des anciennes URL ;
- états de chargement, d’erreur et d’accès ;
- tests Vitest, Testing Library et MSW ;
- développement Sass mobile first.

Le nom affiché de l’espace communautaire est centralisé dans
`src/content/platform.content.js`. Sa route durable est
`/espace-communaute`.
