# Bloc back-end Ressources

## Installation

```bash
npm install
cp .env.example .env
npm run dev
```

Les variables `CLOUDINARY_*` sont facultatives au démarrage, mais obligatoires pour les routes médias. L’API Secret ne doit jamais être transmis au front ni placé dans une requête Postman d’envoi de fichier.

## Référentiels

- Formats : `ARTICLE`, `PODCAST`, `AUDIO`, `VIDEO`, `EBOOK`, `TOOL`, `NEWSLETTER`.
- Visibilités : `PUBLIC`, `MEMBERS_ONLY`.
- Publication : `DRAFT`, `SCHEDULED`, `PUBLISHED`, `UNPUBLISHED`, `ARCHIVED`.
- Validation : `NOT_SUBMITTED`, `PENDING_REVIEW`, `CHANGES_REQUESTED`, `APPROVED`.

Les catégories et leurs libellés sont exposés par `GET /api/resources/meta`.

## Routes principales

### Consultation

| Méthode | Route | Accès | Fonction |
| --- | --- | --- | --- |
| GET | `/api/resources` | Public | Liste, recherche, filtres, tri et pagination |
| GET | `/api/resources/:slug` | Public | Détail ou aperçu verrouillé |
| GET | `/api/resources/:id/related` | Public | Trois ressources similaires |
| GET | `/api/resources/recommendations` | Membre | Recommandations SPM |
| GET | `/api/resources/meta` | Public | Formats et catégories |

Paramètres de liste : `q`, `format`, `category`, `sort`, `page`, `limit`. Les tris sont `newest`, `oldest`, `popular`, `liked`.

### Édition

| Méthode | Route | Accès | Fonction |
| --- | --- | --- | --- |
| POST | `/api/resources` | Admin/intervenante | Créer un brouillon |
| PATCH | `/api/resources/:id/draft` | Propriétaire | Enregistrer le brouillon |
| POST | `/api/resources/:id/revision` | Propriétaire | Préparer une nouvelle version |
| POST | `/api/resources/:id/submit` | Intervenante | Soumettre à validation |
| POST | `/api/resources/:id/publish` | Admin propriétaire | Publier sa ressource |
| GET | `/api/resources/mine` | Admin/intervenante | Ressources gérées |
| GET | `/api/resources/:id/history` | Admin/propriétaire | Historique métier |

### Validation et actions administratives

| Méthode | Route | Fonction |
| --- | --- | --- |
| GET | `/api/admin/resources/reviews` | Soumissions en attente |
| POST | `/api/admin/resources/:id/approve` | Valider et publier/programmer |
| POST | `/api/admin/resources/:id/request-changes` | Demander une correction |
| PATCH | `/api/admin/resources/:id/visibility` | Modifier la visibilité sans toucher au contenu |
| POST | `/api/admin/resources/:id/unpublish` | Dépublier directement |
| POST | `/api/admin/resources/:id/archive` | Archiver directement |
| GET | `/api/admin/resources/action-requests` | Demandes de dépublication/archivage |
| POST | `/api/admin/resources/action-requests/:id/approve` | Accepter une demande |
| POST | `/api/admin/resources/action-requests/:id/reject` | Refuser une demande |
| POST | `/api/admin/resources/:id/republish` | Remettre en ligne |

### Interactions et modération

Les routes `/like`, `/comments` et `/replies` sont placées sous `/api/resources/:id`. Les signalements utilisent `/api/reports`; leur traitement administratif utilise `/api/reports/admin`.

Une vue est enregistrée automatiquement lors de l’ouverture du détail. La route `POST /api/resources/:id/external-click` enregistre un clic externe et un téléchargement PDF est compté lors de la demande d’une URL avec `?download=true`.

### Médias Cloudinary

1. `POST /api/media/upload-authorization` crée un média `PENDING` et retourne l’URL Cloudinary et les champs signés.
2. Le client envoie directement le fichier à Cloudinary avec une requête multipart `POST` contenant le fichier et les champs retournés.
3. `POST /api/media/confirm` reçoit les informations de la réponse Cloudinary et en vérifie la signature.
4. Le média peut être associé au brouillon par son identifiant.
5. `GET /api/media/:id/access` retourne une URL de lecture de 5 minutes après contrôle d’accès.

La couverture d’une ressource membres reste accessible pour son aperçu public. Les PDF, fichiers audio, vidéos et liens externes protégés exigent une session active.

Limites : couverture 5 Mo, PDF 50 Mo, audio 100 Mo, vidéo 100 Mo. Les vidéos plus longues sont publiées sur YouTube.

## Import initial

```bash
npm run import:resources -- ./resources.json --admin=melanie@example.com
```

Chaque entrée doit avoir une clé `externalImportKey` unique, un objet `content`, et éventuellement `status`, `visibility` et `scheduledFor`. Le script valide l’intégralité du contenu et ignore sans duplication les clés déjà importées.

## Nettoyage des médias remplacés

Après validation d’une nouvelle version, les anciens médias passent à l’état `REPLACED`. La commande suivante les supprime effectivement de Cloudinary :

```bash
npm run cleanup:resource-media
```

Cette commande peut être lancée manuellement ou par une tâche planifiée.

La consolidation ajoute une tâche Vercel quotidienne pour ce nettoyage et une tâche toutes les 15 minutes qui fait réellement passer les ressources arrivées à échéance de `SCHEDULED` à `PUBLISHED`.
