# Migration du profil intervenant

Le rôle technique `CONTRIBUTOR` est remplacé par `INTERVENANT`.

La migration met à jour :

- les comptes possédant encore l’ancien rôle ;
- l’historique des actions administratives ;
- les références de documents dans cet historique ;
- les collections des demandes d’intervenantes et de retour au rôle membre.

## Exécution

La commande doit être exécutée une seule fois sur chaque base contenant des
données créées avec l’ancienne version :

```bash
npm run migrate:intervenant-role
```

Les variables d’environnement habituelles de l’API, dont `MONGO_URI`, doivent
être disponibles. La commande est réexécutable lorsqu’une première migration
s’est terminée correctement.

Si les anciennes et les nouvelles collections existent simultanément, la
migration s’interrompt sans en supprimer aucune afin d’éviter toute perte de
données.
