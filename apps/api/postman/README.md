# Recette Postman

Importer :

1. `Plateforme-Melanie-V1.postman_collection.json` ;
2. `Local.postman_environment.json` ;
3. `Staging.postman_environment.json`.

Renseigner `fixturePassword` localement dans Postman. Ne jamais exporter cette
valeur après l’avoir saisie.

La collection est organisée par parcours. Les connexions enregistrent des
jetons séparés pour l’administratrice, la membre et l’intervenante. Les
requêtes destructrices sont préfixées `[DÉSACTIVÉ]` et utilisent une URL vide.
