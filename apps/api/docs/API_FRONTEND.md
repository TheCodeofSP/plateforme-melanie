# API Plateforme Mélanie — Guide d’intégration front

Version correspondant aux blocs consolidés Authentification, Ressources, Quiz et Safe Place.

## 1. Principes généraux

- URL locale de l’API : `http://localhost:5100`
- Préfixe principal : `/api`
- Corps des requêtes : JSON
- Les jetons sont placés dans des cookies `httpOnly` : le JavaScript du front ne doit pas essayer de les lire.
- Toutes les requêtes authentifiées doivent inclure les cookies.

Exemple avec `fetch` :

```js
const response = await fetch(`${API_URL}/api/auth/me`, {
  credentials: "include",
});
```

Avec Axios :

```js
const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});
```

### Réponse d’erreur commune

```json
{
  "success": false,
  "message": "Description lisible de l’erreur",
  "code": "CODE_OPTIONNEL",
  "details": {}
}
```

Le champ `stack` peut apparaître en développement. Il ne doit jamais être affiché à l’utilisatrice.

### Rôles

| Valeur        | Signification             |
| ------------- | ------------------------- |
| `MEMBER`      | Membre connectée          |
| `INTERVENANT` | Intervenante              |
| `ADMIN`       | Mélanie / administratrice |

Une membre ne possède aucun droit de création de ressource. Après acceptation
de sa demande par l’administratrice, son rôle devient `INTERVENANT` et elle peut
proposer des ressources. Ces ressources devront être validées par
l’administratrice avant leur publication dans le futur module Ressources.

### Statuts du compte

| Valeur               | Signification                                       |
| -------------------- | --------------------------------------------------- |
| `PENDING_ACTIVATION` | Email ou autorisation parentale en attente          |
| `ACTIVE`             | Compte utilisable                                   |
| `SUSPENDED`          | Accès bloqué par l’administration                   |
| `ANONYMIZED`         | Compte supprimé et données personnelles anonymisées |

## 2. Santé de l’API

### `GET /api/health`

Accès public. Vérifie que l’application Express répond.

Réponse `200` :

```json
{
  "success": true,
  "status": "OK",
  "message": "API Plateforme Mélanie opérationnelle"
}
```

## 3. Inscription et activation

### `POST /api/auth/register`

Accès public. Crée un compte membre majeur sans mot de passe. L’accès reste bloqué jusqu’à la validation de l’email.

```json
{
  "email": "lea@example.com",
  "firstName": "Léa",
  "lastName": "Martin",
  "pseudonym": "LeaM",
  "profileVisibility": "PSEUDONYM_ONLY",
  "isAdultConfirmed": true,
  "hasAcceptedTerms": true,
  "hasAcknowledgedPrivacyPolicy": true,
  "newsletterConsent": true,
  "commercialEmailConsent": false
}
```

Les inscriptions de personnes mineures sont reportées. Le pseudonyme et l’email sont uniques. Aucun mot de passe n’est créé.

Réponse `201` : `requiresParentalAuthorization` et `emailsAccepted` indiquent le parcours à afficher.

### `POST /api/auth/verify-email`

Accès public. Valide l’adresse email à partir du jeton reçu par email.

```json
{ "token": "jeton_hexadecimal_de_64_caracteres" }
```

Réponse `200` : contient `accountActivated`.

### `POST /api/auth/login`

Envoie un lien de connexion temporaire à l’adresse indiquée. La réponse reste volontairement générique.

```json
{ "email": "lea@example.com" }
```

### `POST /api/auth/login-link`

Consomme une seule fois le jeton du lien reçu et ouvre la session.

```json
{ "token": "jeton_hexadecimal_de_64_caracteres" }
```

### `POST /api/auth/parental-authorization/details`

Accès public destiné à la page ouverte par le responsable légal.

```json
{ "token": "jeton_hexadecimal_de_64_caracteres" }
```

Réponse `200` :

```json
{
  "success": true,
  "authorization": {
    "minorFirstName": "Léa",
    "documentVersion": "draft-1",
    "expiresAt": "...",
    "status": "PENDING"
  }
}
```

Statuts possibles : `PENDING`, `APPROVED`, `DECLINED`, `EXPIRED`, `REVOKED`.

### `POST /api/auth/parental-authorization/respond`

Accès public. Enregistre la réponse du responsable légal.

```json
{
  "token": "jeton_hexadecimal_de_64_caracteres",
  "decision": "APPROVE"
}
```

`decision` accepte `APPROVE` ou `DECLINE`. La réponse contient `authorizationStatus` et `accountActivated`.

### `POST /api/auth/resend-email-verification`

Accès public. Demande un nouveau lien, avec un délai minimal de cinq minutes.

```json
{ "email": "lea@example.com" }
```

La réponse reste volontairement générique pour ne pas révéler si un compte existe.

### `POST /api/auth/resend-parental-authorization`

Accès public. Renvoie l’autorisation au responsable légal si la demande le permet encore.

```json
{ "email": "lea@example.com" }
```

Une autorisation déjà refusée ne peut actuellement pas être renvoyée automatiquement.

## 4. Connexion et sessions

### `POST /api/auth/login`

Accès public.

```json
{
  "email": "lea@example.com",
  "password": "MotDePasse1!",
  "rememberMe": false
}
```

Réponse `200` :

```json
{
  "success": true,
  "message": "Connexion réussie.",
  "user": {
    "id": "...",
    "pseudonym": "LeaM",
    "role": "MEMBER",
    "currentSpmProfile": "NON_DEFINI",
    "quizCompleted": false
  }
}
```

Erreurs utiles : `INVALID_CREDENTIALS`, `ACCOUNT_SUSPENDED`, `ACCOUNT_PENDING_ACTIVATION`. Cette dernière contient `details.pendingValidations` avec `EMAIL_VERIFICATION` et/ou `PARENTAL_AUTHORIZATION`.

### `POST /api/auth/refresh`

Accès via le cookie de renouvellement. Renouvelle la session et remplace les deux cookies. À appeler après une erreur `ACCESS_TOKEN_EXPIRED`, puis rejouer une seule fois la requête initiale.

### `POST /api/auth/logout`

Révoque la session correspondant au cookie et efface les cookies.

### `POST /api/auth/logout-all`

Authentification requise. Révoque toutes les sessions de la membre, y compris la session actuelle.

### `GET /api/auth/sessions`

Authentification requise. Renvoie les appareils connectés. Chaque élément contient notamment `id`, `userAgent`, `rememberMe`, `lastUsedAt`, `createdAt`, `expiresAt` et `isCurrent`.

### `DELETE /api/auth/sessions/:sessionId`

Authentification requise. Déconnecte un appareil. Si la session supprimée est la session courante, les cookies sont également effacés.

## 5. Profil et sécurité du compte

### `GET /api/auth/me`

Authentification requise. Renvoie la fiche du compte courant : identité privée, pseudonyme, rôle, statut, profil SPM, dates de validation et de connexion.

### `PATCH /api/auth/me`

Authentification requise. Modifie au moins un champ parmi :

```json
{
  "firstName": "Léa",
  "lastName": "Martin",
  "pseudonym": "NouveauPseudo"
}
```

La date de naissance et l’email ne sont pas modifiables par cette route.

### `PATCH /api/auth/me/password`

Authentification requise.

```json
{
  "currentPassword": "Ancien1!",
  "newPassword": "Nouveau2!",
  "newPasswordConfirmation": "Nouveau2!"
}
```

La session actuelle reste active ; les autres appareils sont déconnectés.

### `POST /api/auth/forgot-password`

Accès public.

```json
{ "email": "lea@example.com" }
```

Réponse toujours générique. Délai minimal de cinq minutes entre deux demandes.

### `POST /api/auth/reset-password`

Accès public.

```json
{
  "token": "jeton_hexadecimal_de_64_caracteres",
  "password": "Nouveau2!",
  "passwordConfirmation": "Nouveau2!"
}
```

Le lien est valable une heure et toutes les sessions sont révoquées.

### `POST /api/auth/me/email-change`

Authentification requise.

```json
{
  "newEmail": "nouvelle@example.com",
  "currentPassword": "MotDePasse1!"
}
```

L’ancienne adresse reste active jusqu’à la confirmation reçue sur la nouvelle adresse. Un email de sécurité est envoyé à l’ancienne adresse.

### `POST /api/auth/confirm-email-change`

Accès public.

```json
{ "token": "jeton_hexadecimal_de_64_caracteres" }
```

Après confirmation, toutes les sessions sont fermées. L’utilisatrice doit se reconnecter avec sa nouvelle adresse.

### `DELETE /api/auth/me`

Authentification requise.

```json
{
  "currentPassword": "MotDePasse1!",
  "confirmation": "SUPPRIMER"
}
```

Anonymise définitivement les données personnelles. Les futures publications pourront être conservées sous une identité anonymisée lorsque ces modules seront développés.

## 6. Demande pour devenir intervenante

### `GET /api/intervenant-applications/me`

Toute utilisatrice authentifiée. Renvoie l’historique de ses demandes.

### `POST /api/intervenant-applications`

Rôle `MEMBER`. Crée un brouillon. Après un refus, le dernier dossier peut servir de base au nouveau brouillon.

### `PATCH /api/intervenant-applications/:applicationId`

Rôle `MEMBER`. Modifie un brouillon avec au moins un champ :

```json
{
  "professionalName": "Léa Martin Nutrition",
  "profession": "Nutritionniste",
  "specialties": ["SPM", "Émotions"],
  "presentation": "...",
  "motivations": "...",
  "links": {
    "website": "https://example.com",
    "instagram": "https://instagram.com/example",
    "linkedin": null
  }
}
```

Les liens sont facultatifs. Maximum 10 spécialités. Le stockage du justificatif PDF/JPG/PNG est volontairement reporté.

### `POST /api/intervenant-applications/:applicationId/submit`

Rôle `MEMBER`. Envoie le brouillon à Mélanie. Au moment de l’envoi : nom professionnel et profession de 2 à 120 caractères, au moins une spécialité, présentation et motivations de 50 à 2 000 caractères.

### `DELETE /api/intervenant-applications/:applicationId`

Rôle `MEMBER`. Annule un brouillon non soumis.

## 7. Administration des demandes d’intervenantes

Toutes les routes suivantes exigent le rôle `ADMIN`.

### `GET /api/admin/intervenant-applications`

Renvoie les demandes en attente.

### `GET /api/admin/intervenant-applications/:applicationId`

Renvoie le dossier complet et les informations utiles à la décision.

### `POST /api/admin/intervenant-applications/:applicationId/decision`

```json
{
  "decision": "APPROVE",
  "comment": "Commentaire facultatif"
}
```

Une acceptation passe la membre au rôle `INTERVENANT` et active son identité professionnelle. Un refus permet une future nouvelle demande corrigée.

## 8. Retour volontaire au rôle membre

### `GET /api/intervenant-exit-requests/me`

Toute utilisatrice authentifiée. Renvoie son historique de demandes.

### `POST /api/intervenant-exit-requests`

Rôle `INTERVENANT`.

```json
{ "message": "Message facultatif, 1 000 caractères maximum" }
```

### `DELETE /api/intervenant-exit-requests/:requestId`

Rôle `INTERVENANT`. Annule une demande encore en attente.

### `GET /api/admin/intervenant-exit-requests`

Rôle `ADMIN`. Renvoie les demandes en attente.

### `POST /api/admin/intervenant-exit-requests/:requestId/decision`

Rôle `ADMIN`.

```json
{
  "decision": "APPROVE",
  "comment": "Commentaire facultatif"
}
```

Une acceptation remet le compte au rôle `MEMBER` et désactive son profil professionnel.

## 9. Administration des comptes

Toutes ces routes exigent le rôle `ADMIN`. Le front doit toujours afficher une fenêtre de confirmation avant de les appeler, avec un commentaire facultatif.

### `GET /api/admin/users/:userId`

Renvoie la fiche administrative d’un compte, son profil professionnel, ses demandes d’intervenante, ses demandes de retour membre et l’historique des actions administratives.

### `POST /api/admin/users/:userId/suspend`

```json
{ "comment": "Commentaire facultatif" }
```

Suspend le compte et révoque ses sessions.

### `POST /api/admin/users/:userId/reactivate`

```json
{ "comment": "Commentaire facultatif" }
```

Réactive un compte suspendu.

### `POST /api/admin/users/:userId/revoke-intervenant`

```json
{ "comment": "Commentaire facultatif" }
```

Retire directement le rôle intervenante et archive son profil professionnel.

### `DELETE /api/admin/users/:userId`

```json
{
  "confirmation": "ANONYMISER",
  "comment": "Commentaire facultatif"
}
```

Anonymise les données personnelles. L’administration ne peut pas s’anonymiser elle-même.

## 10. Stratégie front recommandée pour les sessions

1. Envoyer toutes les requêtes avec `credentials: "include"`.
2. Si une route répond `401` avec `ACCESS_TOKEN_EXPIRED`, appeler une seule fois `POST /api/auth/refresh`.
3. Si le renouvellement réussit, rejouer la requête initiale.
4. Si le renouvellement échoue avec `INVALID_SESSION`, vider l’état utilisateur du front et rediriger vers la connexion.
5. Éviter plusieurs renouvellements simultanés : mutualiser une seule promesse de refresh.

## 11. Points volontairement reportés

- fiche CRM générale et futurs segments de communication ;
- Safe Place ;
- webinaires et événements ;
- notifications internes ;
- dashboards membre, intervenante et administratrice ;
- export CSV du Quiz, réservé au futur dashboard ;
- textes juridiques définitifs, actuellement versionnés `draft-1`.

## 12. Bloc Quiz SPM

La documentation complète des routes, payloads, égalités, consentements et valeurs de contraception se trouve dans `docs/QUIZ_BACKEND.md`.

## 13. Consolidation — Comptes administratifs

### `GET /api/admin/users`

Accès : `ADMIN`.

Paramètres : `q`, `role`, `accountStatus`, `quizCompleted`, `isMinor`, `sort`, `page`, `limit`.

Tris : `newest`, `oldest`, `lastLogin`, `name`.

Réponse :

```json
{
  "success": true,
  "users": [],
  "pagination": { "page": 1, "limit": 20, "total": 0, "pages": 0 }
}
```

Les autres routes administratives des comptes décrites en section 9 restent inchangées.

## 14. Consolidation — Consentements

| Méthode | Route                          | Accès  | Fonction                                       |
| ------- | ------------------------------ | ------ | ---------------------------------------------- |
| `GET`   | `/api/auth/documents/versions` | Public | Versions juridiques actives                    |
| `GET`   | `/api/auth/me/consents`        | Membre | Consentements actuels et historique disponible |
| `PATCH` | `/api/auth/me/consents`        | Membre | Modifier Newsletter et email commercial        |

Exemple de modification :

```json
{
  "newsletter": false,
  "commercialEmail": true
}
```

Les consentements obligatoires ne sont pas modifiables par cette route.

## 15. Consolidation — Profil professionnel

### Routes intervenante

| Méthode | Route                                   | Fonction                                             |
| ------- | --------------------------------------- | ---------------------------------------------------- |
| `GET`   | `/api/professional-profile/me`          | Profil, brouillon et version publiée                 |
| `PATCH` | `/api/professional-profile/me/draft`    | Modifier le brouillon                                |
| `POST`  | `/api/professional-profile/me/submit`   | Soumettre à Mélanie                                  |
| `POST`  | `/api/professional-profile/me/revision` | Copier la version publique dans un nouveau brouillon |

Champs du brouillon :

```json
{
  "professionalName": "Nom professionnel",
  "displayedFirstName": "Prénom",
  "displayedLastName": "Nom",
  "profession": "Profession",
  "specialties": ["Spécialité"],
  "shortPresentation": "Présentation courte",
  "biography": "Biographie complète",
  "photo": "ID_MEDIA_OU_NULL",
  "website": "https://exemple.fr"
}
```

Les champs peuvent être envoyés partiellement avec `PATCH`. Une soumission exige tous les champs obligatoires. Le site internet est facultatif.

### Routes publiques

| Méthode | Route                           | Fonction                                                             |
| ------- | ------------------------------- | -------------------------------------------------------------------- |
| `GET`   | `/api/professionals`            | Profils publiés avec `q`, `profession`, `specialty`, `page`, `limit` |
| `GET`   | `/api/professionals/:profileId` | Fiche publiée                                                        |

### Routes Mélanie

| Méthode | Route                                                              | Fonction                         |
| ------- | ------------------------------------------------------------------ | -------------------------------- |
| `GET`   | `/api/admin/professional-profiles`                                 | Liste avec statuts et pagination |
| `GET`   | `/api/admin/professional-profiles/:profileId`                      | Profil, compte et historique     |
| `POST`  | `/api/admin/professional-profiles/:profileId/approve`              | Approuver et publier             |
| `POST`  | `/api/admin/professional-profiles/:profileId/request-changes`      | Demander une correction          |
| `PATCH` | `/api/admin/professional-profiles/:profileId/editorial-correction` | Correction éditoriale motivée    |
| `POST`  | `/api/admin/professional-profiles/:profileId/hide`                 | Masquer immédiatement            |
| `POST`  | `/api/admin/professional-profiles/:profileId/restore`              | Restaurer la version approuvée   |

## 16. Consolidation — Justificatifs privés

| Méthode  | Route                                                      | Fonction                                |
| -------- | ---------------------------------------------------------- | --------------------------------------- |
| `POST`   | `/api/intervenant-applications/media/upload-authorization` | Obtenir les champs Cloudinary signés    |
| `POST`   | `/api/intervenant-applications/media/confirm`              | Confirmer la réponse Cloudinary         |
| `GET`    | `/api/intervenant-applications/media/:documentId/access`   | URL privée valable 5 minutes            |
| `DELETE` | `/api/intervenant-applications/media/:documentId`          | Supprimer un document encore modifiable |

Formats : PDF, JPEG, PNG. Taille maximale : 10 Mo. Le front envoie le fichier directement vers l’URL Cloudinary reçue.

Pour une photo professionnelle, utiliser les routes `/api/media` existantes avec `purpose: "PROFILE_PHOTO"`.

## 17. Consolidation — Administration du Quiz

| Méthode | Route                                                              | Fonction                                |
| ------- | ------------------------------------------------------------------ | --------------------------------------- |
| `GET`   | `/api/admin/quiz/participants`                                     | Liste, recherche, filtres et pagination |
| `GET`   | `/api/admin/quiz/participants/:participantId`                      | Identité, tentatives et consentements   |
| `GET`   | `/api/admin/quiz/attempts/:attemptId`                              | Réponses et scores détaillés            |
| `GET`   | `/api/admin/quiz/stats`                                            | Statistiques générales                  |
| `POST`  | `/api/admin/quiz/attempts/:attemptId/retry-email`                  | Relancer un email en échec              |
| `POST`  | `/api/admin/quiz/participants/:participantId/retry-marketing-sync` | Relancer une synchronisation en échec   |

Filtres de liste : `q`, `profile`, `accountType`, `status`, `marketingConsent`, `emailStatus`, `marketingSyncStatus`, `dateFrom`, `dateTo`, `sort`, `page`, `limit`.

`accountType` vaut `MEMBER` ou `GUEST`. `status` vaut `COMPLETED` ou `INCOMPLETE`. Aucun paramètre d’export n’est accepté.

Le détail d’une tentative expose notamment :

- `answers[].questionLabel` ;
- `answers[].answerLabel` ;
- `answers[].awardedProfiles` ;
- `scores` ;
- `calculatedProfiles` ;
- `selectedProfile` ;
- `participantInfo` ;
- `resultEmail`.

## 18. Consolidation — Listes Ressources

Les routes suivantes renvoient désormais `pagination` en plus de leur tableau :

- `GET /api/admin/resources/reviews` ;
- `GET /api/admin/resources/action-requests` ;
- `GET /api/reports/admin`.

Le front doit utiliser `page` et `limit` plutôt que supposer que toutes les lignes sont retournées.

## 19. Codes d’erreur ajoutés

| Code                                  | Signification                                    |
| ------------------------------------- | ------------------------------------------------ |
| `PROFESSIONAL_PROFILE_NOT_FOUND`      | Aucun profil associé ou visible                  |
| `PROFESSIONAL_PROFILE_INCOMPLETE`     | Soumission incomplète                            |
| `PROFESSIONAL_PROFILE_PENDING_REVIEW` | Version verrouillée pendant la validation        |
| `PROFESSIONAL_SOLICITATION_FORBIDDEN` | Coordonnée ou prospection détectée               |
| `INVALID_PROFILE_PHOTO`               | Photo absente, non confirmée ou non propriétaire |
| `APPLICATION_DOCUMENT_FORBIDDEN`      | Justificatif inaccessible ou demande verrouillée |
| `DOCUMENT_MISMATCH`                   | Confirmation Cloudinary invalide                 |
| `QUIZ_PARTICIPANT_NOT_FOUND`          | Participante inexistante                         |
| `QUIZ_ATTEMPT_NOT_FOUND`              | Participation inexistante                        |
| `QUIZ_EMAIL_NOT_RETRYABLE`            | Email non éligible à une relance                 |
| `QUIZ_MARKETING_SYNC_NOT_RETRYABLE`   | Synchronisation non éligible                     |
| `RATE_LIMIT_EXCEEDED`                 | Limite générale atteinte                         |
| `AUTH_RATE_LIMIT_EXCEEDED`            | Limite des routes d’authentification atteinte    |

# Annexe — Routes Safe Place

Toutes les routes protégées utilisent les cookies d’authentification (`credentials: "include"`). Les routes membre exigent le rôle `MEMBER`, une charte courante acceptée et aucune suspension Safe Place. L’administratrice dispose du même accès fonctionnel ; les intervenantes sont exclues.

## Accès et catégories

| Méthode | Route                                    | Accès      | Usage                            |
| ------- | ---------------------------------------- | ---------- | -------------------------------- |
| GET     | `/api/safe-place/charter`                | Public     | Version et texte de la charte    |
| GET     | `/api/safe-place/access`                 | Connecté   | État d’accès et motif de blocage |
| POST    | `/api/safe-place/charter/accept`         | Membre     | Accepter la version courante     |
| POST    | `/api/safe-place/charter/withdraw`       | Membre     | Retirer son consentement         |
| GET     | `/api/safe-place/categories`             | Safe Place | Catégories visibles              |
| GET     | `/api/safe-place/categories/:categoryId` | Safe Place | Catégorie et compteurs           |

Administration des catégories : `GET/POST /api/admin/safe-place/categories`, `PATCH /:categoryId`, puis `POST /:categoryId/hide`, `/restore`, `/archive`, ou `DELETE /:categoryId`.

## Discussions, commentaires et médias

| Méthode              | Route                                            | Corps principal                                                |
| -------------------- | ------------------------------------------------ | -------------------------------------------------------------- |
| GET / POST           | `/api/safe-place/posts`                          | création : `title`, `content`, `categoryId`, `images`, `links` |
| GET / PATCH / DELETE | `/api/safe-place/posts/:postId`                  | modification avec les mêmes champs                             |
| POST                 | `/api/safe-place/posts/:postId/correction`       | proposition après demande de correction                        |
| GET / POST           | `/api/safe-place/posts/:postId/comments`         | création : `{ "content": "..." }`                              |
| POST                 | `/api/safe-place/comments/:commentId/replies`    | `{ "content": "..." }`                                         |
| PATCH / DELETE       | `/api/safe-place/comments/:commentId`            | modifier ou supprimer son commentaire                          |
| POST                 | `/api/safe-place/comments/:commentId/correction` | correction demandée                                            |
| PUT / DELETE         | `/api/safe-place/posts/:postId/reaction`         | `{ "type": "SUPPORT" }` ou retrait                             |
| PUT / DELETE         | `/api/safe-place/comments/:commentId/reaction`   | même fonctionnement                                            |

L’upload privé suit quatre routes : `POST /api/safe-place/media/upload-authorization`, `POST /confirm`, `GET /:mediaId/access` et `DELETE /:mediaId`. Une discussion accepte trois médias confirmés maximum.

## Signalements et contenu personnel

- `POST /api/safe-place/reports` avec `targetType`, `targetId`, `reason` et éventuellement `details`.
- `GET /api/safe-place/reports/me` liste ses signalements.
- `GET /api/safe-place/my-content` reste disponible après retrait de la charte.
- `DELETE /api/safe-place/my-content/posts/:postId` et `/comments/:commentId` permettent la suppression dans ce cas.

## Modération administratrice

Le préfixe est `/api/admin/safe-place` :

- file et signalements : `GET /moderation`, `GET /reports/:reportId`, puis `POST /review`, `/keep`, `/hide`, `/request-correction`, `/close-discussion` ou `/suspend-author` ;
- discussions : `POST /posts/:postId/request-correction`, `/close`, `/reopen`, `/pin`, `/unpin`, `/hide`, `/restore`, `/correction-decision`, `PATCH /category`, `PUT/DELETE /warning`, `GET /history` ;
- commentaires : `POST /comments/:commentId/request-correction`, `/hide`, `/restore`, `/correction-decision`, et `GET /history` ;
- suspensions : `GET /suspensions`, `POST /users/:userId/suspend`, `POST /suspensions/:suspensionId/lift`, `GET /users/:userId/history` ;
- outils : `GET /stats` et `POST /notifications/broadcast`.

`correction-decision` reçoit `decision` (`APPROVE`, `REQUEST_CHANGES` ou `REJECT`) et un éventuel `comment`.

## Notifications

### Cloche et détail

Toutes les routes sont authentifiées.

| Méthode | Route                                          | Fonction                                       |
| ------- | ---------------------------------------------- | ---------------------------------------------- |
| GET     | `/api/notifications`                           | Charge 10 notifications et retourne un curseur |
| GET     | `/api/notifications/unread-count`              | Compteurs total, personnel et gestion          |
| GET     | `/api/notifications/:notificationId`           | Détail et passage automatique en lu            |
| POST    | `/api/notifications/:notificationId/read`      | Marquer comme lue                              |
| POST    | `/api/notifications/:notificationId/unread`    | Remettre en non-lu                             |
| POST    | `/api/notifications/read-all`                  | Marquer une sélection comme lue                |
| DELETE  | `/api/notifications/:notificationId`           | Masquage personnel                             |
| DELETE  | `/api/notifications`                           | Masquage global filtré                         |
| POST    | `/api/notifications/:notificationId/handled`   | Marquer une alerte de gestion traitée          |
| POST    | `/api/notifications/:notificationId/unhandled` | Remettre une alerte à traiter                  |

Paramètres de `GET /api/notifications` :

- `nature=PERSONAL|MANAGEMENT` ;
- `category=...` ;
- `status=READ|UNREAD` ;
- `sort=NEWEST|OLDEST` ;
- `limit=10` par défaut, 50 maximum ;
- `cursor=<date ISO>` retourné par la page précédente.

`read-all` et la suppression globale acceptent un body facultatif permettant
de limiter l'action à une nature, une catégorie ou un statut.

Le front interroge `/unread-count` à la connexion, lors des changements de page
et environ toutes les 60 secondes. Il affiche le nombre exact jusqu'à 99, puis
`99+`.

### Préférences

| Méthode | Route                            | Fonction               |
| ------- | -------------------------------- | ---------------------- |
| GET     | `/api/notifications/preferences` | Préférences actuelles  |
| PATCH   | `/api/notifications/preferences` | Modification partielle |

Exemple :

```json
{
  "categories": {
    "RESOURCES": {
      "platform": true,
      "email": false
    },
    "SAFE_PLACE": {
      "platform": false,
      "email": true
    }
  }
}
```

Lorsque `platform` est désactivé et `email` activé, la réponse contient un
avertissement que le front doit présenter avant ou après confirmation.

### Tests administratifs

| Méthode | Route                                    | Fonction                         |
| ------- | ---------------------------------------- | -------------------------------- |
| POST    | `/api/admin/notifications/test`          | Envoi d'un test à Mélanie        |
| POST    | `/api/admin/notifications/email-preview` | Prévisualisation HTML sans envoi |

Exemple de test :

```json
{
  "title": "Notification de test",
  "message": "Vérification du fonctionnement.",
  "category": "ACCOUNT_SECURITY",
  "channels": ["PLATFORM", "EMAIL"],
  "actionPath": "/profile"
}
```

### Règles d'intégration

- l'onglet `MANAGEMENT` est réservé aux administratrices ;
- le détail d'une réaction contient `pseudonymSnapshot`, `reactionType` et
  `occurredAt` ;
- `handledAt` est indépendant de `readAt` ;
- une ressource ou publication indisponible doit afficher un message générique ;
- après une connexion, le front doit reprendre le chemin `actionPath` demandé ;
- le lien Google Meet n'est jamais retourné par une notification.

# Annexe — Routes Webinaires

## Consultation et participation

| Méthode        | Route                                                        | Accès        | Fonction                                                    |
| -------------- | ------------------------------------------------------------ | ------------ | ----------------------------------------------------------- |
| GET            | `/api/webinars`                                              | Public       | Liste publiée et sessions disponibles                       |
| GET            | `/api/webinars/:webinarId`                                   | Public       | Présentation et dates, sans lien Meet                       |
| GET            | `/api/webinars/me`                                           | Connecté     | Inscriptions, statuts, attente et lien Meet lorsqu’autorisé |
| POST           | `/api/webinars/sessions/:sessionId/register`                 | Connecté     | Inscription ou liste d’attente                              |
| POST           | `/api/webinars/registrations/:registrationId/confirm`        | Connecté     | Confirmation d’une place proposée                           |
| POST           | `/api/webinars/registrations/:registrationId/cancel`         | Connecté     | Annulation jusqu’à une heure avant                          |
| POST           | `/api/webinars/registrations/:registrationId/change-session` | Connecté     | Choix d’une autre session                                   |
| POST           | `/api/webinars/sessions/:sessionId/questions`                | Participante | Question privée                                             |
| PATCH / DELETE | `/api/webinars/questions/:questionId`                        | Autrice      | Modification ou suppression                                 |
| PUT            | `/api/webinars/sessions/:sessionId/evaluation`               | Participante | Création ou modification de l’évaluation                    |
| GET            | `/api/webinars/:webinarId/replay`                            | Connecté     | Accès au lien du replay actif                               |
| POST           | `/api/webinars/:webinarId/replay/view`                       | Connecté     | Enregistrement d’une consultation                           |

`change-session` reçoit `{ "sessionId": "..." }`. Le lien Meet n’apparaît dans `/me` que pour une inscription confirmée et pendant la dernière heure.

## Administration

Préfixe : `/api/admin/webinars`.

- `GET /` et `GET /:webinarId` : liste et détail complet ;
- `POST /`, `PATCH /:webinarId`, `POST /:webinarId/status` : création et workflow ;
- `POST /:webinarId/sessions`, `PATCH /sessions/:sessionId` : sessions et lien Meet ;
- `POST /sessions/:sessionId/cancel` : annulation avec notifications ;
- `POST /sessions/:sessionId/registrations/close` ou `/open` : contrôle manuel ;
- `GET/POST /sessions/:sessionId/registrations` : liste ou inscription manuelle ;
- `POST /registrations/:registrationId/change-session` : déplacement administratif ;
- `PATCH /registrations/:registrationId/attendance` : `PRESENT` ou `ABSENT` ;
- `GET /sessions/:sessionId/questions` et `PATCH /questions/:questionId/status` : gestion des questions ;
- `PUT /:webinarId/replay` : lien et disponibilité du replay ;
- `GET /:webinarId/stats` : inscriptions, présences, évaluations, profils SPM et vues du replay.

L’upload de l’image passe par `POST /api/media/upload-authorization` avec `purpose: "WEBINAR_IMAGE"`, puis `POST /api/media/confirm`.

# Annexe — Newsletter / Communications

## Préférences

| Méthode | Route                                       | Accès    | Fonction                            |
| ------- | ------------------------------------------- | -------- | ----------------------------------- |
| GET     | `/api/communication-preferences/me`         | Connecté | Préférences actuelles               |
| PATCH   | `/api/communication-preferences/me`         | Connecté | Modification par catégorie          |
| GET     | `/api/communications/unsubscribe?token=...` | Public   | Contenu de la page de désabonnement |
| POST    | `/api/communications/unsubscribe`           | Public   | Désabonnement ciblé ou complet      |
| POST    | `/api/communications/resubscribe`           | Public   | Envoi du lien de confirmation       |
| POST    | `/api/communications/resubscribe/confirm`   | Public   | Confirmation du réabonnement        |

Préférences disponibles : `editorialNewsletter`, `resourceAnnouncements`, `webinarAnnouncements`, `platformNews`.

## Administration

Préfixe : `/api/admin/communications`.

- `GET /`, `POST /`, `GET /:communicationId`, `PATCH /:communicationId`, `DELETE /:communicationId` ;
- `POST /:communicationId/preview` et `/test` ;
- `GET /:communicationId/recipient-preview` et `/recipients` ;
- `POST /:communicationId/schedule`, `/send`, `/cancel`, `/duplicate`, `/retry-failures` ;
- `GET /:communicationId/events` ;
- `POST /recipients/:recipientId/lift-suppression`.

Le canal vaut `EMAIL` ou `IN_APP`. Les statuts sont `DRAFT`, `SCHEDULED`, `SENDING`, `SENT`, `CANCELLED` et `FAILED`.

Les familles de ciblage sont combinées en `ET`. Les valeurs d’une même famille, notamment les profils SPM, sont combinées en `OU`. Les destinataires manuels s’ajoutent à la cible mais restent soumis aux consentements marketing.

L’upload d’une image utilise les routes `/api/media` existantes avec `purpose: "COMMUNICATION_IMAGE"`.

## Webhook et statistiques

`POST /api/webhooks/resend/communications` est réservé à Resend. Sa signature
est vérifiée à partir des en-têtes `svix-*` et du corps brut. Le front ne doit
jamais l’appeler. Les compteurs et événements alimentent les tableaux et
exports du Dashboard.

# Annexe — Dashboard

Toutes les routes `/api/admin/dashboard` exigent un compte `ADMIN`.

# Annexe — Stabilisation V1

## Contrat transversal

Toutes les dates sont retournées au format ISO 8601 en UTC. Le frontend assure
leur conversion vers le fuseau d’affichage de l’utilisatrice.

Chaque réponse contient les en-têtes :

```text
X-API-Version: 1.0.0
X-Request-ID: identifiant-de-la-requête
```

Une erreur utilise le contrat suivant et n’expose jamais de stack :

```json
{
  "success": false,
  "message": "Les données sont invalides.",
  "code": "VALIDATION_ERROR",
  "details": {
    "email": ["Adresse email invalide"]
  },
  "requestId": "d8c9c919-0691-45b7-b8df-3decb79f91fc"
}
```

Une liste vide retourne un tableau vide et une pagination dont `total` et
`pages` valent `0`, jamais une erreur `404`.

## État du système

Toutes ces routes exigent le rôle `ADMIN`.

| Méthode | Route                                | Fonction                                                 |
| ------- | ------------------------------------ | -------------------------------------------------------- |
| `GET`   | `/api/admin/system/status`           | Version, MongoDB, email, Cloudinary, crons et migrations |
| `POST`  | `/api/admin/system/checks`           | Vérifier explicitement Resend ou Cloudinary              |
| `GET`   | `/api/admin/system/email-dispatches` | Lister les métadonnées des emails capturés               |

Exemple de contrôle externe :

```json
{
  "services": ["RESEND", "CLOUDINARY"]
}
```

Filtres du journal email : `type`, `status`, `recipient`, `dateFrom`, `dateTo`,
`page` et `limit`. Le contenu HTML, les liens privés, les jetons et les pièces
jointes ne sont jamais exposés.

## Accueil

| Méthode | Route       | Fonction                                 |
| ------- | ----------- | ---------------------------------------- |
| GET     | `/overview` | Indicateurs et profils SPM               |
| GET     | `/tasks`    | Relances et actions des différents blocs |
| GET     | `/activity` | Activité CRM récente                     |

`overview` et `activity` acceptent `dateFrom` et `dateTo` au format ISO.

## Contacts

| Méthode | Route                            | Fonction                                   |
| ------- | -------------------------------- | ------------------------------------------ |
| GET     | `/contacts`                      | Liste unifiée et pression de communication |
| GET     | `/members`                       | Membres uniquement                         |
| GET     | `/prospects`                     | Prospects Quiz uniquement                  |
| POST    | `/contacts`                      | Contact manuel                             |
| GET     | `/contacts/:contactId`           | Fiche, notes, relances et historique       |
| PATCH   | `/contacts/:contactId`           | Données CRM uniquement                     |
| DELETE  | `/contacts/:contactId`           | Suppression d'une fiche sans historique    |
| POST    | `/contacts/:contactId/anonymize` | Anonymisation                              |
| POST    | `/contacts/merge`                | Fusion de deux fiches                      |
| POST    | `/contact-merges/:id/restore`    | Restauration d'une fusion                  |

Filtres principaux : `q`, `kind`, `status`, `spmProfile`, `contraception`,
`priority`, `tag`, `inactiveDays`, `dateFrom`, `dateTo` et `sort`.

Le détail peut retourner une date de naissance complète. Cette consultation,
les notes et l'historique sont journalisés.

## Notes, étiquettes et relances

```http
POST   /contacts/:contactId/notes
PATCH  /notes/:id
DELETE /notes/:id

GET    /tags
POST   /tags
PATCH  /tags/:id
POST   /tags/:id/archive

POST   /contacts/:contactId/tasks
PATCH  /tasks/:id
POST   /tasks/:id/complete
POST   /tasks/:id/snooze
```

Résultats d'une relance : `NO_RESPONSE`, `EXCHANGE_COMPLETED`, `INTERESTED`,
`APPOINTMENT_SCHEDULED`, `DO_NOT_CONTACT` et `FREE_NOTE`.

## Invitations

Administration :

```http
POST /api/admin/dashboard/contacts/:contactId/invitations
POST /api/admin/dashboard/invitations/:id/renew
POST /api/admin/dashboard/invitations/:id/cancel
```

Public puis authentifié :

```http
GET  /api/dashboard/invitations/:token
POST /api/dashboard/invitations/:token/accept
```

Le `GET` fournit uniquement les champs de préremplissage. Après l'inscription
normale, le front appelle `accept` avec la session authentifiée.

## Analyses et blocs

```http
POST /analytics/cross-analysis
GET  /resources
GET  /safe-place
GET  /webinars
GET  /communications
```

Une analyse croisée reçoit `primaryCriterion`, `secondaryCriterion`, `filters`,
`groups` et `includeAnonymized`. Le mode retourné est toujours
`LATEST_RESULT`.

## Segments et vues

Les mêmes opérations `GET`, `POST`, `PATCH /:itemId` et `DELETE /:itemId`
sont disponibles sous :

- `/segments` ;
- `/saved-views` ;
- `/saved-analyses`.

Un segment statique contient `contactIds`. Un segment dynamique contient ses
`criteria`. Pour cibler une communication depuis le CRM, transmettre les
identifiants à `targeting.manualCrmContacts`.

## Exports CSV

```http
POST   /exports/preview
POST   /exports
GET    /exports/:id
GET    /exports/:id/download
DELETE /exports/:id
```

Le premier `POST` retourne les colonnes et cinq lignes d'aperçu. Le second
crée une tâche et répond avec le statut `PENDING`. Lorsque le statut devient
`READY`, `download` retourne une URL privée valable cinq minutes.

Le fichier et sa tâche expirent après 24 heures.
