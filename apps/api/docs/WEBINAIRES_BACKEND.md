# Bloc backend Webinaires

## Périmètre livré

- Présentation publique des webinaires et des sessions, sans divulgation du lien Google Meet.
- Participation réservée aux comptes actifs `MEMBER`, `INTERVENANT` et `ADMIN`.
- Création et animation réservées à Mélanie (`ADMIN`) pour cette version.
- Plusieurs sessions indépendantes par webinaire, avec une seule inscription active par personne.
- Capacité par session, liste d’attente ordonnée et promotion avec confirmation à durée adaptative.
- Annulation et changement de session jusqu’à une heure avant.
- Questions privées avant la session, évaluation après la session et présence manuelle.
- Replay externe accessible aux membres et intervenantes, avec suivi des vues.
- Recommandations selon deux profils SPM maximum.
- Emails Resend et notifications internes.
- Tâches Vercel pour les rappels, fermetures et promotions.

## Médias

L’image utilise les routes `/api/media` existantes avec `purpose: "WEBINAR_IMAGE"`. Après confirmation Cloudinary, son identifiant est transmis dans `imageId` lors de la création ou modification du webinaire.

## Statuts

- Webinaire : `DRAFT`, `PUBLISHED`, `COMPLETED`, `CANCELLED`, `ARCHIVED`.
- Session : `SCHEDULED`, `POSTPONED`, `CANCELLED`, `COMPLETED`.
- Inscription : `REGISTERED`, `WAITLISTED`, `PRESENT`, `ABSENT`, `CANCELLED`.

## Automatisation

Les routes internes sont protégées par `CRON_SECRET` :

- `/api/internal/cron/webinar-reminders-24` ;
- `/api/internal/cron/webinar-reminders-1` ;
- `/api/internal/cron/maintain-webinars`.

Le rappel d’une heure n’est pas envoyé si le lien Meet manque ; Mélanie reçoit alors une alerte interne urgente.

## Installation et vérification

```bash
npm install
npm test
npm run dev
```

Aucune nouvelle variable d’environnement n’est obligatoire. Le bloc réutilise Resend, Cloudinary, `CLIENT_URL` et `CRON_SECRET`.
