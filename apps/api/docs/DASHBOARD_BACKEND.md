# Dashboard — Backend

## Objectif

Le Dashboard est le centre de pilotage réservé à Mélanie. Il centralise les
membres, prospects, quiz, ressources, Safe Place, webinaires et communications.
La première version retourne des nombres, pourcentages et tableaux, sans
graphique.

## CRM unifié

`CrmContact` relie, sans les remplacer, `User` et `QuizParticipant`. Une fiche
peut provenir d'un quiz public, d'une inscription, d'un webinaire, d'un ajout
manuel, d'un import ou d'une autre source. Toutes les sources sont conservées
avec leur date.

Statuts fixes :

- `NOUVEAU` ;
- `A_CONTACTER` ;
- `CONTACTE` ;
- `A_RELANCER` ;
- `INTERESSE` ;
- `NON_INTERESSE` ;
- `ACCOMPAGNE_CLIENT` ;
- `NE_PAS_CONTACTER`.

Le dernier statut désactive le consentement facultatif et bloque le contact
dans le moteur de ciblage Communications. Les messages obligatoires restent
autorisés.

La commande suivante crée les fiches correspondant aux données existantes :

```bash
npm run migrate:crm-contacts
```

Elle peut être rejouée : le rapprochement est effectué par email normalisé.

## Contacts manuels et invitations

Un contact manuel est non consentant par défaut. Un consentement positif exige
une date et une source.

Une invitation :

- est transactionnelle ;
- expire après sept jours ;
- peut être envoyée ou copiée ;
- utilise un jeton haché ;
- préremplit prénom, nom et email ;
- est annulable et renouvelable ;
- ne vaut jamais consentement marketing.

Le compte créé suit le parcours légal normal puis est rattaché à la fiche CRM.

## Notes, étiquettes et relances

Les notes sont privées, textuelles, épinglables et sans pièce jointe.
Les étiquettes ont un nom, une couleur et peuvent être archivées.

Les relances conservent :

- titre, échéance, priorité et note ;
- dates antérieures après reprogrammation ;
- statut ;
- résultat ;
- date de réalisation.

Une relance échue reste active et produit une notification de gestion. Le
résultat `DO_NOT_CONTACT` bloque automatiquement les envois facultatifs.

## Analyse Quiz

Le moteur ne conserve qu'un résultat complet par personne : le plus récent.
Il croise :

- profil SPM ;
- contraception ;
- tranche d'âge ;
- catégories de réponses ;
- membre ou prospect ;
- participation aux webinaires.

Les pourcentages sont arrondis à une décimale. Un groupe de moins de cinq
personnes renvoie `insufficientSample: true` et aucun pourcentage.

Les données anonymisées sont exclues par défaut. Leur inclusion facultative
n'est possible que dans une agrégation, jamais dans une liste ou un export.

## Autres espaces

- Ressources : vues, visiteurs uniques, téléchargements, clics externes, likes,
  commentaires et profils SPM avec seuil de confidentialité.
- Safe Place : volumes globaux, activité, catégories, signalements et délais de
  traitement ; aucun contenu privé dans les statistiques ou exports.
- Webinaires : inscriptions, attente, présence, absence, taux de présence,
  replay, profils SPM et contraception.
- Communications : ciblage, exclusions, livraisons, ouvertures, clics,
  désabonnements et notifications internes lues.

## Segments et vues

`DashboardSavedItem` stocke :

- segments dynamiques ou statiques ;
- vues enregistrées ;
- analyses enregistrées.

Les critères sont conservés, pas les résultats. Les données sont recalculées à
chaque ouverture.

Une sélection CRM peut alimenter `targeting.manualCrmContacts` d'une
communication.

## Exports

Populations :

- contacts ;
- membres ;
- prospects ;
- derniers résultats de quiz ;
- inscriptions et présences aux webinaires ;
- destinataires des communications ;
- ressources.

Le choix des colonnes est strictement validé. Les notes privées exigent une
confirmation explicite. Le Safe Place et les données techniques ne sont jamais
exportables.

Les exports sont générés en arrière-plan, stockés temporairement comme fichiers
Cloudinary privés et supprimés après 24 heures. Le téléchargement utilise une
URL signée de cinq minutes. Le journal détaillé disparaît avec le fichier ; un
journal minimal de sécurité conserve uniquement le fait qu'un export a eu lieu.

## Tâches Vercel

- `/api/internal/cron/notify-dashboard-tasks` : toutes les heures ;
- `/api/internal/cron/expire-dashboard-invitations` : quotidien ;
- `/api/internal/cron/process-dashboard-exports` : toutes les 15 minutes ;
- `/api/internal/cron/cleanup-dashboard-exports` : quotidien.

Toutes exigent `CRON_SECRET`.

## Déploiement

Avant le déploiement Vercel :

1. renseigner toutes les variables de `.env.example` ;
2. définir `CLIENT_URL` avec l'URL exacte du front ;
3. configurer Cloudinary pour les exports privés ;
4. déployer l'API depuis `apps/api` ;
5. vérifier `/api/health` ;
6. lancer `npm run migrate:email-provider`, puis
   `npm run migrate:crm-contacts` sur la base de
   production ;
7. tester une invitation, une relance et un export ;
8. configurer le webhook Resend public.
