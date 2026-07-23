# Préparation du backend staging sur Vercel

Le déploiement n’est pas exécuté pendant la stabilisation. Cette configuration
prépare le premier environnement distant après l’intégration frontend.

## Variables principales

```env
NODE_ENV=production
APP_ENV=staging
MONGO_URI=mongodb+srv://.../plateforme_melanie_staging
CLIENT_URL=https://front-staging.vercel.app
ALLOWED_ORIGINS=https://front-staging.vercel.app
VERCEL_PREVIEW_HOST_SUFFIX=-equipe.vercel.app

EMAIL_PROVIDER=resend
EMAIL_MODE=capture
EMAIL_CONTACT_SYNC_ENABLED=false
RESEND_DEVELOPMENT_RECIPIENT=adresse-developpement@example.org

CLOUDINARY_FOLDER_PREFIX=plateforme-melanie/staging
```

Ajouter également les secrets JWT, cron, Resend et Cloudinary directement dans
Vercel. Ils ne doivent jamais être placés dans Git ou dans Postman.

## Après le déploiement

1. vérifier `/api/health` ;
2. lancer `npm run migrate:register-history` sur la base staging ;
3. lancer `npm run seed:staging` depuis un environnement sécurisé ;
4. vérifier `/api/admin/system/status` ;
5. exécuter les parcours Postman ;
6. vérifier les cookies entre les deux domaines ;
7. configurer le webhook Resend public ;
8. contrôler les dernières exécutions cron ;
9. lancer `npm run audit:data`.

## Passage ultérieur en production

La production devra utiliser une autre base, un préfixe Cloudinary distinct, un
domaine Resend vérifié et `EMAIL_MODE=resend`. L’API refuse la production avec
le domaine `resend.dev`, le mode capture, un cron absent ou un dossier
Cloudinary contenant `local`, `test` ou `staging`.
