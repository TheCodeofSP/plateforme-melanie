# Changelog

## 1.0.1 — Harmonisation des emails d’authentification

### Expérience frontend

- ajout d’un Design System partagé pour les emails transactionnels ;
- harmonisation visuelle des cinq emails d’authentification ;
- signature « Mélanie Dizet — coach et accompagnante — Sur le chemin du
  bien-être gynécologique » ;
- liens d’activation et de sécurité alignés avec les URL françaises du front ;
- conservation de l’échappement des données personnalisées ;
- tests automatisés du rendu, des liens et de la signature.

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
