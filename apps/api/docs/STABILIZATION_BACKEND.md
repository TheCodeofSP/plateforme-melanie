# Stabilisation finale du backend V1

## Contrat figé

La version `1.0.0` constitue le contrat utilisé par le frontend. Les routes ne
sont pas préfixées par `/v1`. Une évolution incompatible devra être documentée
comme une nouvelle version.

Toutes les réponses exposent `X-API-Version` et `X-Request-ID`. Les erreurs ne
contiennent jamais de stack. Les dates sont sérialisées en ISO 8601 UTC.

## Environnements MongoDB

Trois usages sont séparés :

- développement local : base actuelle ;
- tests automatisés : nom terminé par `_automated_test` ;
- recette distante : nom terminé par `_staging`.

Les tests refusent `MONGO_TEST_URI === MONGO_URI`, exigent le suffixe exact et
`ALLOW_TEST_DATABASE_RESET=true`. Le reset staging exige :

```env
ALLOW_STAGING_RESET=true
STAGING_RESET_CONFIRMATION=RESET_PLATEFORME_MELANIE_STAGING
```

Le reset staging ne supprime que les documents portant une `fixtureKey` de la
stabilisation.

## Commandes

```bash
npm run seed:test
npm run test:integration
npm run seed:staging
npm run reset:staging
npm run audit:data
npm run quality
```

`seed:test` réinitialise uniquement la base automatisée. `seed:staging` est
idempotent et complète les fixtures absentes.

## Fixtures

Les fixtures contiennent :

- une administratrice ;
- quatre membres couvrant les quatre profils SPM et plusieurs contraceptions ;
- une membre sans Quiz ;
- une mineure ;
- une membre suspendue du Safe Place ;
- une intervenante active avec profil publié ;
- une candidature en attente ;
- des prospects CRM ;
- une ressource, une publication Safe Place, un webinaire, une communication
  et une notification.

Tous les comptes sont vérifiés. Leur mot de passe provient exclusivement de
`FIXTURE_PASSWORD`.

## Emails

Chaque envoi produit une métadonnée dans `EmailDispatchLog`, conservée trente
jours :

- type ;
- destinataire initiale ;
- destinataire réelle de capture ;
- objet ;
- mode ;
- statut ;
- identifiant Resend ;
- identifiant de requête ;
- tentatives et erreur nettoyée.

Le contenu HTML, les jetons, liens privés, pièces jointes et réponses Quiz ne
sont jamais enregistrés.

## Audit

`npm run audit:data` ne modifie aucune donnée. Il génère un rapport JSON dans
`.reports/` et renvoie un code non nul en présence d’une anomalie critique.
Les réparations restent des scripts spécialisés et explicitement déclenchés.

## Qualité

`npm run quality` exécute :

1. ESLint ;
2. les tests unitaires et de contrats locaux ;
3. la validation de `.env.example` ;
4. la cohérence du contrat frontend ;
5. l’audit npm des dépendances de production.

Les tests d’intégration MongoDB sont séparés car ils nécessitent les variables
sécurisées de la base automatisée.

## Routes système

Réservées à l’administratrice :

- `GET /api/admin/system/status` ;
- `POST /api/admin/system/checks` ;
- `GET /api/admin/system/email-dispatches`.

La route d’état n’expose ni URI, ni clé, ni secret. Les contrôles externes sont
déclenchés explicitement et n’envoient aucun email.
