# Consolidation Authentification, Ressources et Quiz

## Périmètre livré

Cette consolidation ajoute :

- la liste administrative des comptes avec recherche, filtres, tri et pagination ;
- les préférences de consentement et l’exposition des versions juridiques ;
- le profil professionnel versionné, validé par Mélanie et protégé contre la prospection ;
- les photos professionnelles Cloudinary ;
- les justificatifs privés des candidatures et leur suppression après trois mois ;
- l’administration des participantes et participations au quiz ;
- l’accès de Mélanie aux réponses et scores détaillés ;
- les statistiques du quiz, sans export CSV ;
- trois tentatives automatiques pour Resend et l’email de résultat ;
- les relances manuelles administratives ;
- la suppression des quiz publics incomplets après 30 jours ;
- la suppression des quiz publics terminés après trois ans avec archive anonyme ;
- la finalisation réelle des publications programmées ;
- le nettoyage planifié des médias et justificatifs ;
- la pagination des validations, demandes d’action et signalements Ressources ;
- des en-têtes de sécurité et une limitation générale des requêtes.

## Installation

```bash
npm install
cp .env.example .env
npm run migrate:professional-profiles
npm test
npm run dev
```

La migration des profils professionnels est idempotente : elle ne transforme que les anciens documents qui ne possèdent pas encore `draftVersion`.

## Variables supplémentaires

```env
CRON_SECRET=une_valeur_aleatoire_de_32_caracteres_minimum
RESEND_NEWSLETTER_SEGMENT_ID=
RESEND_COMMERCIAL_SEGMENT_ID=
```

Les identifiants des segments Newsletter et Commercial sont facultatifs.
MongoDB reste la source principale des consentements. La synchronisation
distante est désactivée en développement.

## Profils professionnels

Le profil contient une `draftVersion` et une `publishedVersion`. Une modification n’écrase jamais immédiatement la version publique. Les champs publics sont : nom professionnel, prénom et nom affichés, profession, spécialités, présentation courte, biographie, photo, site internet.

Les emails, téléphones, liens de réservation, liens de paiement, tarifs, promotions et appels commerciaux sont refusés. Le site internet reste le seul lien externe autorisé. Mélanie peut approuver, demander une correction, effectuer une correction éditoriale limitée, masquer ou restaurer le profil.

Une intervenante doit disposer d’un profil publié et actif avant de pouvoir créer une nouvelle ressource.

## Quiz et données sensibles

Les routes administratives permettent de consulter les réponses et les scores. Chaque ouverture d’une participante ou d’une participation détaillée est enregistrée dans `QuizAdminAccessLog`.

L’export CSV n’est volontairement pas inclus dans ce bloc. Il reste réservé au futur dashboard.

Les erreurs d’envoi utilisent les champs : `attempts`, `lastAttemptAt`, `nextRetryAt` et `lastError`. Après trois tentatives automatiques, Mélanie peut déclencher une nouvelle série manuellement.

## Conservation

- quiz public incomplet : 30 jours ;
- quiz public terminé : 3 ans ;
- quiz d’une membre : jusqu’à la suppression du compte ;
- justificatif de candidature : 3 mois après la décision ;
- ancien média remplacé : jusqu’au prochain nettoyage planifié.

Avant la suppression d’un quiz public terminé, les dimensions non identifiantes sont recopiées dans `QuizAnonymousArchive`.

## Tâches Vercel

Le fichier `vercel.json` programme :

- publication des ressources toutes les 15 minutes ;
- relance des livraisons Quiz toutes les 15 minutes ;
- nettoyages quotidiens des quiz, documents et médias.

Vercel envoie automatiquement `Authorization: Bearer <CRON_SECRET>` aux Cron Jobs. Les routes refusent toute requête si `CRON_SECRET` est absent ou incorrect.

Certaines offres Vercel limitent la fréquence des tâches planifiées. Si l’offre utilisée n’accepte pas une fréquence de 15 minutes, adapter `vercel.json` à la fréquence autorisée ou utiliser un planificateur externe envoyant le même en-tête Bearer.

## Vérifications

```bash
npm test
npm run check
```

Les appels Resend et Cloudinary doivent aussi être vérifiés dans l’environnement de recette avec des comptes de test. Les tests automatisés ne doivent jamais supprimer de vrais médias ni envoyer de vrais emails.
