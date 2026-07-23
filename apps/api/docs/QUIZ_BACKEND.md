# Bloc back-end Quiz SPM

## Périmètre livré

Le bloc permet à une visiteuse d’au moins 15 ans ou à une membre active de réaliser le quiz SPM. Il calcule un profil unique, demande un choix personnel en cas d’égalité, conserve l’historique des tentatives, envoie le résultat avec Resend et rattache les anciens quiz publics au compte après vérification de l’adresse email.

Le dashboard, les statistiques, le suivi commercial et l’export CSV ne font pas partie de ce bloc.

## Configuration supplémentaire

La synchronisation distante est désactivée pendant le développement. Pour la
préparation de la production, un segment Resend dédié au Quiz peut être
configuré :

```env
RESEND_QUIZ_SEGMENT_ID=identifiant-uuid-du-segment
```

MongoDB reste la source principale du consentement. Lorsque la synchronisation
est activée en production, une visiteuse consentante est associée au segment
Quiz et le statut global Resend suit son consentement.

## Questionnaire

- Version : `1.0`
- 11 questions obligatoires
- 5 questions `MENSTRUAL_CYCLE`
- 2 questions `PHYSICAL_SYMPTOMS`
- 4 questions `EMOTIONAL_SYMPTOMS`

Le front ne reçoit jamais les profils associés aux réponses. Le calcul est exclusivement effectué par l’API.

## Routes

### `GET /api/quiz`

Route publique. Retourne la version, les catégories, les questions, les choix de contraception et l’âge minimal du parcours public.

### `POST /api/quiz/attempts`

Route publique avec authentification facultative.

- Avec un cookie de session valide : parcours membre.
- Sans cookie : `firstName`, `email` et `participantInfo.age` sont obligatoires.
- Une visiteuse de moins de 15 ans reçoit l’erreur `QUIZ_MINIMUM_AGE`.
- Si l’adresse appartient déjà à un compte, la visiteuse doit se connecter et reçoit `QUIZ_ACCOUNT_LOGIN_REQUIRED`.

Exemple visiteuse :

```json
{
  "quizVersion": "1.0",
  "firstName": "Camille",
  "email": "camille@example.com",
  "participantInfo": {
    "age": 29,
    "contraception": "PILL"
  },
  "answers": [
    { "questionId": "q1", "answerKey": "cycle_21_35" },
    { "questionId": "q2", "answerKey": "luteale_13_16" },
    { "questionId": "q3", "answerKey": "flux_normal" },
    { "questionId": "q4", "answerKey": "regles_3_7" },
    { "questionId": "q5", "answerKey": "remarque_inconnue" },
    { "questionId": "q9", "answerKey": "fringale" },
    { "questionId": "q11", "answerKey": "etourdissement" },
    { "questionId": "q6", "answerKey": "fragilite" },
    { "questionId": "q7", "answerKey": "fatigue" },
    { "questionId": "q8", "answerKey": "epuisement" },
    { "questionId": "q10", "answerKey": "fatigue_psychique" }
  ],
  "consents": {
    "spmDataProcessing": true,
    "resultEmail": true,
    "marketingCommunications": true,
    "personalContact": false
  }
}
```

Pour une membre, `firstName`, `email` et `participantInfo.age` peuvent être omis. L’API utilise le compte et recalcule l’âge depuis la date de naissance.

#### Réponse sans égalité

Une membre reçoit le contenu de son résultat dans `result`. Une visiteuse reçoit `result: null`, car son résultat complet est envoyé par email.

```json
{
  "success": true,
  "status": "COMPLETED",
  "attemptId": "...",
  "candidateProfiles": [],
  "resultDeliveredByEmail": true,
  "accountCreationRecommended": true
}
```

#### Réponse avec égalité

```json
{
  "success": true,
  "status": "AWAITING_PROFILE_SELECTION",
  "attemptId": "...",
  "selectionToken": "jeton-temporaire",
  "candidateProfiles": [
    {
      "profile": "BOULE_DE_NERFS",
      "title": "Boule de nerfs",
      "summary": "..."
    },
    {
      "profile": "DOUCE_MELANCOLIE",
      "title": "Douce mélancolie",
      "summary": "..."
    }
  ],
  "resultDeliveredByEmail": false
}
```

Pour une visiteuse, conserver temporairement `selectionToken` jusqu’au choix. Ce jeton expire après 30 minutes. Il ne doit jamais être placé dans une URL.

### `POST /api/quiz/attempts/:attemptId/profile-selection`

Finalise une égalité. Le profil doit obligatoirement appartenir à `candidateProfiles`.

Visiteuse :

```json
{
  "profile": "DOUCE_MELANCOLIE",
  "selectionToken": "jeton-temporaire"
}
```

Membre connectée :

```json
{
  "profile": "DOUCE_MELANCOLIE"
}
```

L’email n’est envoyé qu’après ce choix.

### `GET /api/quiz/me/result`

Authentification obligatoire. Retourne le profil actuel, sa date, son résumé et son contenu. Retourne `result: null` si aucun quiz n’est terminé.

### `GET /api/quiz/me/history`

Authentification obligatoire. Retourne uniquement les profils finaux et leurs dates, du plus récent au plus ancien. Les réponses et les scores ne sont jamais exposés.

### `GET /api/quiz/me/prefill`

Authentification obligatoire. Retourne le prénom, l’email, l’âge actuel et la dernière contraception déclarée. Cette route ne renvoie ni l’ancien profil, ni les anciennes réponses.

## Valeurs de contraception

```text
INJECTION
PILL
HORMONAL_IUD
PATCH
IMPLANT
VAGINAL_RING
NONE
PREFER_NOT_TO_SAY
```

## Rattachement au compte

Le rattachement des tentatives publiques intervient après activation du compte, jamais avant la vérification de l’email. La dernière tentative terminée actualise automatiquement `User.currentSpmProfile` et `User.quizCompleted`.

## Emails

Une tentative valide reste enregistrée même si Resend refuse temporairement l’email. Son état est conservé dans :

```text
resultEmail.status = PENDING | SENT | FAILED
```

Le futur bloc d’administration pourra repérer et relancer les envois en échec.

## Suppression du compte

La consolidation ajoute également l’administration du Quiz sous `/api/admin/quiz`, les réponses et scores détaillés, les statistiques, ainsi que les relances email et Resend. L’export CSV reste volontairement reporté au futur dashboard.

L’anonymisation supprime les tentatives, les consentements et le participant liés au compte. Le contact est également retiré de la liste Quiz de Resend.
