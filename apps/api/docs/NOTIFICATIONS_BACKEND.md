# Bloc Notifications — Backend

## Périmètre livré

Le bloc consolide les notifications déjà présentes dans Authentification,
Ressources, Safe Place, Webinaires et Communications.

Deux canaux indépendants sont disponibles :

- `PLATFORM` : notification dans la cloche ;
- `EMAIL` : email transactionnel Resend.

Deux natures sont distinguées :

- `PERSONAL` : activité propre à l'utilisatrice ;
- `MANAGEMENT` : gestion de la plateforme.

Mélanie voit deux onglets dans la même cloche. Les futures administratrices
peuvent être associées à plusieurs périmètres : comptes, ressources, Safe
Place, webinaires, communications et incidents techniques.

## Préférences

Les catégories personnelles configurables sont :

- `ACCOUNT_SECURITY` ;
- `RESOURCES` ;
- `SAFE_PLACE` ;
- `WEBINARS` ;
- `COMMUNICATIONS` ;
- `PERSONAL_ADMINISTRATION`.

Chaque catégorie contient deux booléens, `platform` et `email`. Les valeurs par
défaut sont `platform: true` et `email: false`. Les notifications obligatoires
ignorent ces préférences.

Une désinscription globale reçue par le webhook Resend désactive les emails
facultatifs. Elle ne désactive pas les notifications internes.

## Regroupement

Les réactions d'un même contenu sont regroupées dans une notification. Le
détail conserve le pseudonyme, le type de réaction et sa date. Une nouvelle
réaction fait remonter la notification et la remet en non-lu. Le retrait d'une
réaction retire son détail ; la notification est masquée lorsqu'elle ne contient
plus aucune réaction active.

Les réponses, commentaires et mentions restent indépendants. Une modification
de contenu ne notifie que les nouvelles mentions ajoutées.

## Emails et reprises

Les emails utilisent `NotificationDelivery`. Chaque envoi possède une clé
d'idempotence. Les reprises sont programmées après 15 minutes, 1 heure puis
6 heures. Un échec définitif crée une notification de gestion technique.

Le webhook existant `/api/webhooks/resend/communications` reconnaît également
les emails de notification : livraison, ouverture, clic, rejet et
désinscription.

Les emails Safe Place sont génériques et n'exposent aucun contenu sensible. Le
lien Google Meet est uniquement présent dans l'email de rappel envoyé une heure
avant le webinaire.

## Conservation

Une notification expire un an après sa création, lue ou non. Le nettoyage
quotidien supprime les notifications expirées, leurs détails et les données
techniques devenues inutiles. Une suppression de compte retire immédiatement
les notifications, détails, préférences et livraisons associés.

## Tâches Vercel

- `GET /api/internal/cron/process-notification-deliveries` : traitement et
  reprises des emails ;
- `GET /api/internal/cron/cleanup-notifications` : expiration quotidienne.

Ces routes exigent `Authorization: Bearer <CRON_SECRET>`.

## Préparation Vercel

Le point d'entrée serverless se trouve dans `api/index.js`. La connexion
MongoDB est réutilisée entre les invocations lorsque Vercel conserve
l'instance.

Variables nécessaires :

- `NODE_ENV=production` ;
- `MONGO_URI` ;
- `CLIENT_URL` ;
- `JWT_ACCESS_SECRET` ;
- `CRON_SECRET` ;
- `RESEND_API_KEY` ;
- `RESEND_FROM_EMAIL` ;
- `RESEND_FROM_NAME` ;
- `RESEND_DEVELOPMENT_RECIPIENT` ;
- `RESEND_WEBHOOK_SECRET` ;
- identifiants facultatifs des segments Resend ;
- variables Cloudinary.

Après le premier déploiement :

1. vérifier `GET /api/health` ;
2. enregistrer l'URL publique du webhook Resend ;
3. vérifier que Vercel transmet `CRON_SECRET` aux tâches ;
4. utiliser `/api/admin/notifications/test` ;
5. contrôler les domaines CORS et les cookies du front de production.
