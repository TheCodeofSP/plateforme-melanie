# Bloc 1 — décisions de Mélanie intégrées

## Parcours retenu

- inscription gratuite en V1, réservée aux femmes majeures concernées par une problématique gynécologique ;
- prénom, nom, email et pseudonyme demandés ; date de naissance, téléphone et ville non demandés ;
- pseudonyme unique, modifiable par la membre ; choix entre le pseudonyme ou le prénom comme identité visible dans le forum ;
- inscription et connexion sans mot de passe ;
- après inscription, une page demande de consulter sa messagerie ;
- adresse email obligatoirement confirmée avant l’accès au compte ;
- connexion par lien personnel, à usage unique, valable 15 minutes ;
- une seule session active et cookies supprimés à la fermeture du navigateur ;
- arrivée sur le tableau de bord après connexion ;
- ordre du tableau de bord : forum, ressources et profil SPM, webinaires, accompagnements, notifications ;
- charte obligatoire avant la première entrée dans le forum et après une modification importante ;
- profil professionnel distinct du compte personnel d’une intervenante ;
- seules l’adresse email et le pseudonyme sont modifiables depuis le compte ;
- suppression immédiate après la confirmation `SUPPRIMER` ;
- publications du forum conservées et anonymisées ;
- résultats du Quiz SPM conservés sous une identité anonymisée ;
- une suspension peut viser le forum seul ou le compte entier selon la gravité ; le motif est communiqué et peut être contesté.

## Décisions conservées en attente

- formulation éditoriale genrée ou inclusive ;
- durée métier définitive d’une session côté serveur ;
- participation d’une intervenante au forum ;
- personne chargée de valider une demande d’intervenante ;
- contenu final, signature et adresse de réponse des emails ;
- règles supplémentaires de suspension indiquées comme « autre / à réfléchir » ;
- durée exacte de conservation des données anonymisées du Quiz SPM.
- procédure définitive lorsqu’une membre reçoit une alerte de changement d’adresse email qu’elle n’a pas demandée. En V2, le message lui demande de ne rien valider et de contacter Mélanie ; aucun mot de passe n’existe à modifier.

## Point de vigilance avant mise en production

Le questionnaire rend la newsletter obligatoire pour créer un compte. Cette règle a été reproduite dans la V2 demandée, tout en laissant les communications commerciales facultatives. Elle doit faire l’objet d’une validation juridique/RGPD avant la mise en production.

## Recette du lien de connexion

1. créer et confirmer un compte ;
2. ouvrir `/connexion` et saisir l’adresse email ;
3. en développement avec `EMAIL_MODE=capture`, récupérer le lien affiché dans le terminal API ;
4. vérifier que le lien ouvre l’espace membre ;
5. vérifier qu’un second clic refuse le lien déjà utilisé ;
6. demander deux liens successifs et vérifier que seul le dernier fonctionne ;
7. se connecter sur un second navigateur et vérifier que la première session est révoquée.

## Recette complémentaire V2

1. valider une adresse email puis réutiliser le même lien : le second essai doit indiquer que le lien a déjà été utilisé, sans reproduire l’écran de réussite ;
2. confirmer un changement d’adresse : toutes les sessions doivent être révoquées et l’interface doit revenir à l’état déconnecté ;
3. supprimer un compte : la membre doit être renvoyée vers l’accueil et tous ses anciens liens de connexion doivent être refusés ;
4. vérifier que la page du compte affiche le prénom et le nom, sans permettre leur modification ;
5. vérifier qu’une membre connectée conserve le bouton « Explorer les ressources » dans la navigation.
