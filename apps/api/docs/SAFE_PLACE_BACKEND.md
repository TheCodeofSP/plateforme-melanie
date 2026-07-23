# Bloc backend Safe Place

## Installation

```bash
npm install
npm run seed:safe-place
npm test
npm run dev
```

Le seed crée ou met à jour les huit catégories initiales. Il peut être relancé sans créer de doublons.

## Règles d’accès

- `MEMBER` : accès après acceptation de la version courante de la charte.
- `ADMIN` : accès complet, sans acceptation obligatoire de la charte.
- `INTERVENANT` : exclusion stricte. Une intervenante doit utiliser un compte personnel membre distinct.
- Une suspension Safe Place active bloque aussi la lecture.
- Après retrait de la charte, `GET /api/safe-place/my-content` et ses routes de suppression restent accessibles.

## Fonctionnalités livrées

- Charte versionnée et consentement traçable.
- Catégories administrables ; la catégorie « Annonces Mélanie » est réservée à l’administratrice.
- Discussions en texte brut, liens externes contrôlés et trois images privées maximum.
- Commentaires et réponses sur un seul niveau.
- Réactions `SUPPORT`, `THANK_YOU`, `ME_TOO`, `HELPFUL`, sans liste publique des personnes.
- Signalements dédupliqués, priorisés et historisés.
- Modération : masquer/restaurer, fermer/rouvrir, épingler, déplacer, avertir et demander/valider/refuser une correction.
- Suspensions temporaires ou définitives, notifications internes et annonces groupées.
- Statistiques agrégées sans contenu sensible.
- Anonymisation compatible avec la conservation des échanges utiles.

## Sécurité et confidentialité

Les contenus refusent le HTML. Les commentaires refusent les liens. Les règles anti-prospection sont appliquées aux discussions et commentaires. Les images Safe Place passent par l’autorisation d’upload existante, sont limitées en type/taille et restent `MEMBERS_ONLY`. Les réponses exposent le pseudonyme courant, jamais l’identité réelle.

## Tâches Vercel

Les routes sous `/api/cron` exigent `CRON_SECRET`. `vercel.json` planifie l’expiration des suspensions et le nettoyage des notifications, contenus supprimés et médias Safe Place. Vérifier que la fréquence choisie est disponible dans l’offre Vercel utilisée.

## Variables

Aucune nouvelle variable obligatoire n’est ajoutée : les variables MongoDB, JWT, Cloudinary, CORS et `CRON_SECRET` du socle consolidé restent utilisées.
