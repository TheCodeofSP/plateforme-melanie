# Bloc backend Newsletter / Communications

## Fonctionnalités

- Création réservée à Mélanie.
- Canal exclusif `EMAIL` ou `IN_APP`.
- Brouillon, programmation, envoi immédiat, annulation et duplication.
- Blocs structurés : titres, textes, images, citations, listes, séparateurs, boutons, encadrés, ressources et webinaires.
- Ciblage en `ET` entre familles et en `OU` dans une même famille.
- Ciblage des rôles, profils SPM, contacts Quiz et participantes aux webinaires.
- Déduplication par adresse email avec priorité au compte.
- Préférences séparées et désabonnement sécurisé.
- Envoi par lots, reprise et trois relances à 15 minutes, 1 heure et 6 heures.
- Webhook Resend sécurisé et dédupliqué.
- Historique figé par envoi et données prêtes pour le futur Dashboard.

## Configuration

En développement, les contacts restent exclusivement dans MongoDB et tous les
emails sont redirigés vers l'adresse de la développeuse :

```env
EMAIL_MODE=capture
EMAIL_CONTACT_SYNC_ENABLED=false
RESEND_DEVELOPMENT_RECIPIENT=adresse-developpement@example.org
```

Les segments Resend sont facultatifs et réservés à la préparation de la
production :

```env
RESEND_NEWSLETTER_SEGMENT_ID=
```

Configurer dans Resend le webhook transactionnel vers :

```text
https://URL_DE_L_API/api/webhooks/resend/communications
```

Recopier ensuite dans `RESEND_WEBHOOK_SECRET` le secret de signature fourni par
Resend. La signature Svix est vérifiée à partir du corps brut et des en-têtes du
webhook. Ne jamais placer ce secret dans le code ou le dépôt Git.

## Médias

Les images utilisent `/api/media` avec `purpose: "COMMUNICATION_IMAGE"`. Les médias confirmés sont liés à la campagne et conservés lorsqu’ils appartiennent à un envoi figé.

## Tâches Vercel

Les tâches protégées par `CRON_SECRET` sont :

- `send-scheduled-communications` ;
- `process-communication-batches` ;
- `retry-communication-deliveries` ;
- `anonymize-old-communication-recipients` ;
- `cleanup-communication-media`.

## Vérification

```bash
npm install
npm test
npm run dev
```

Avant un premier envoi réel, conserver `EMAIL_MODE=capture`, tester la
prévisualisation et l’email de test, puis vérifier le webhook avec un événement
Resend de test.
