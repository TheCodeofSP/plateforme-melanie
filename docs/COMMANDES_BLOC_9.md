# Commandes de validation

Depuis `apps/web` :

```bash
npm ci
npm run lint
npm run audit:content
npm test
npm run build
```

Depuis `apps/api` :

```bash
npm ci
npm run lint
npm test
```

Les contenus éditoriaux authentiques et les discussions de démonstration sont optionnels :

```bash
npm run seed:editorial-resources
npm run seed:circle-demo
npm run cleanup:circle-demo
```

Les scripts sont idempotents. Le dernier supprime uniquement les discussions portant la clé de démonstration du bloc 9.
