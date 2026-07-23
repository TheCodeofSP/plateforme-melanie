# Changelog

## 1.0.0 — Backend figé pour intégration frontend

### Stabilisation

- contrat API V1 sans préfixe de route ;
- version et identifiant de requête sur toutes les réponses ;
- erreurs homogènes sans stack ;
- CORS local, staging et previews contrôlées ;
- protections strictes des environnements ;
- journal des emails conservé trente jours ;
- état des services et contrôles externes administratifs ;
- registre des migrations ;
- audit non destructif des données ;
- fixtures séparées pour tests automatisés et staging ;
- préfixes Cloudinary par environnement ;
- ESLint et commande qualité ;
- tests d’intégration protégés ;
- collection Postman par parcours ;
- documentation frontend et staging consolidée.

### Contrats renommés avant gel

- suppression des références fonctionnelles à Brevo ;
- `marketingSync` remplace `brevoSync` ;
- `retry-marketing-sync` remplace l’ancienne route dépendante du fournisseur.

À partir de cette version, toute modification de route ou de champ doit être
classée comme correction compatible, décision fonctionnelle ou évolution
postérieure à la V1.
