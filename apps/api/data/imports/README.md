# Import initial des articles de Mélanie

Le fichier `articles.v3.json` contient les articles validés dans le tableau
`Suivis contenus.xlsx`, leurs niveaux d’accès, leurs auteures et leurs dates
d’origine lorsqu’elles sont connues.

Les images associées sont servies par le site depuis
`apps/web/public/images/articles`. Elles ne nécessitent donc pas de transfert
manuel dans Cloudinary.

Depuis `apps/api`, lancer une seule fois :

```bash
npm run import:resources -- ./data/imports/articles.v3.json --admin=ADRESSE_ADMIN
```

Remplacer `ADRESSE_ADMIN` par l’adresse du compte administratrice actif de
Mélanie. L’import est idempotent : une seconde exécution ignore les articles
déjà créés grâce à leur clé `externalImportKey`.

L’article « Pourquoi ne pas être entendue par des professionnels, aggrave la
douleur ? » est conservé en brouillon privé, car le document transmis indique
encore « À venir ». L’article « Santé bucco-dentaire et fertilité » n’est pas
inclus : il est validé dans le tableau, mais son document n’a pas été transmis.
