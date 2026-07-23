# Checklist d’intégration frontend V1

## Configuration

- utiliser `credentials: "include"` pour les routes authentifiées ;
- conserver et transmettre `X-Request-ID` lors d’une reprise de requête ;
- lire les erreurs avec `message`, `code`, `details` et `requestId` ;
- considérer toutes les dates comme UTC ;
- ne jamais appeler les routes `/api/internal/cron` ou `/api/webhooks` ;
- ne jamais exposer de secret Resend, Cloudinary, JWT ou cron dans le front.

## Permissions

| Domaine | Visiteuse | Membre | Intervenante | Administratrice |
| --- | --- | --- | --- | --- |
| Quiz public | Oui | Oui | Oui si connectée | Oui |
| Ressources publiques | Oui | Oui | Oui | Oui |
| Ressources membres | Non | Oui | Oui | Oui |
| Création Ressource | Non | Non | Ses ressources | Toutes |
| Safe Place | Non | Oui | Non | Oui |
| Webinaires visibles | Oui | Oui | Oui | Oui |
| Participation Webinaire | Non | Oui | Oui | Oui |
| Profil professionnel | Lecture publique | Lecture | Gestion du sien | Validation |
| Notifications personnelles | Non | Oui | Oui | Oui |
| Communications administratives | Non | Non | Non | Oui |
| Dashboard et CRM | Non | Non | Non | Oui |
| État du système | Non | Non | Non | Oui |

Une intervenante souhaitant utiliser le Safe Place doit employer un compte
personnel distinct.

## Listes

- afficher correctement le tableau vide de la route (`items: []`, `resources: []`, etc.) ;
- utiliser systématiquement `pagination` ;
- ne pas déduire un `404` d’une liste vide ;
- préserver les filtres documentés dans `API_FRONTEND.md`.

## Authentification distante

- local : cookies `SameSite=Lax` et non sécurisés ;
- staging/production HTTPS : cookies `Secure`, `HttpOnly`, `SameSite=None` ;
- les erreurs `401` déclenchent le parcours de renouvellement de session ;
- un `403` indique une permission insuffisante, pas une session expirée.

## Critères de recette frontend

- chaque rôle peut uniquement ouvrir ses espaces ;
- aucune identité réelle n’est affichée dans le Safe Place ;
- les réponses Quiz détaillées et notes CRM restent administratives ;
- les emails staging apparaissent uniquement dans la boîte de capture ;
- les erreurs affichées peuvent être retrouvées grâce au `requestId`.
