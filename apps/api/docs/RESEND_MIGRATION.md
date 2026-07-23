# Migration email vers Resend

## Développement sécurisé

Le backend utilise un fournisseur générique avec Resend comme adaptateur.
Lorsque `EMAIL_MODE=capture`, tous les emails sont envoyés à
`RESEND_DEVELOPMENT_RECIPIENT`. L'objet commence par :

```text
[DEV → destinataire-initiale@example.org]
```

La destinataire fonctionnelle reste donc vérifiable sans contacter de membre,
prospect ou intervenante. La synchronisation distante des contacts est
désactivée avec `EMAIL_CONTACT_SYNC_ENABLED=false`.

## Variables

```env
EMAIL_PROVIDER=resend
EMAIL_MODE=capture
EMAIL_CONTACT_SYNC_ENABLED=false
RESEND_API_KEY=re_xxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_FROM_NAME=Plateforme Melanie
RESEND_DEVELOPMENT_RECIPIENT=adresse-developpement@example.org
RESEND_QUIZ_SEGMENT_ID=
RESEND_NEWSLETTER_SEGMENT_ID=
RESEND_COMMERCIAL_SEGMENT_ID=
RESEND_WEBHOOK_SECRET=
```

## Migration MongoDB

Après l'intégration du code :

```bash
npm run migrate:email-provider
```

Cette migration idempotente renomme `brevoSync` en `marketingSync` dans les
participantes Quiz et adapte les journaux de relance existants.

## Contrats renommés

- filtre `marketingSyncStatus` ;
- champ `marketingSync` ;
- route
  `POST /api/admin/quiz/participants/:participantId/retry-marketing-sync` ;
- erreur `QUIZ_MARKETING_SYNC_NOT_RETRYABLE`.

Les anciennes routes et propriétés Brevo sont supprimées.

## Production

Le passage en production nécessitera :

1. la vérification d'un domaine d'envoi ;
2. `EMAIL_MODE=resend` ;
3. la création éventuelle des segments ;
4. `EMAIL_CONTACT_SYNC_ENABLED=true` ;
5. un webhook public sur
   `/api/webhooks/resend/communications` ;
6. la copie de son secret de signature dans `RESEND_WEBHOOK_SECRET`.
