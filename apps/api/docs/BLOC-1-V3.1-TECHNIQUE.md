# Bloc 1 — V3.1 technique

Cette version aligne le code du bloc « Comptes et authentification » avec le parcours validé : inscription réservée aux personnes majeures et connexion sans mot de passe.

## Parcours actifs

- création d’un compte majeur ;
- confirmation de l’adresse email ;
- demande d’un lien temporaire de connexion ;
- consommation unique et atomique du lien ;
- renouvellement et révocation des sessions ;
- modification du profil et de l’adresse email ;
- suppression et anonymisation du compte.

Les anciens parcours de mot de passe et d’autorisation parentale ne sont plus exposés. Le modèle historique d’autorisation parentale est conservé uniquement pour permettre le nettoyage d’anciennes données lors de la suppression d’un compte.

## Garanties techniques

- les jetons de validation email et de connexion sont consommés atomiquement ;
- les opérations sensibles sont regroupées dans des transactions MongoDB ;
- un lien utilisé, expiré ou invalide ne peut pas créer de session ;
- une nouvelle connexion révoque les sessions précédentes conformément à la décision fonctionnelle ;
- les durées et types de jetons sont centralisés dans `src/config/auth.constants.js` ;
- les exports des modules d’authentification sont explicites ;
- Prettier et ESLint contrôlent la présentation et la qualité statique du bloc.

## Commandes de contrôle

### API

```bash
npm run format:check
npm run lint
npm test
npm run test:integration
```

Les tests d’intégration nécessitent `MONGO_TEST_URI`, `ALLOW_TEST_DATABASE_RESET=true` et une base MongoDB de test compatible avec les transactions. Sans cette configuration, ils sont explicitement ignorés afin de ne jamais utiliser une base réelle par erreur.

### Frontend

```bash
npm run format:check
npm run lint
npm test
npm run build
```

## Scénarios d’intégration couverts

- connexion d’une administratrice et accès à une route protégée ;
- refus de cette route à une membre ;
- refus d’une seconde utilisation du même lien ;
- concurrence entre deux consommations du même lien ;
- activation d’un compte par email puis refus de la réutilisation du lien.
