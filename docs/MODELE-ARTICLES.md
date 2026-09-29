# Modèle commun des articles — 30 septembre 2026

Référence : « Gérer sa fertilité en autonomie ». Base de travail : dernier ZIP fourni, `plateforme-melanie-main (1).zip` (archive Git cbd9c87e497232502232a4c2d5ed387aa6dc908a).

## Structure à utiliser

| Élément | Bloc | Présentation |
| --- | --- | --- |
| Titre de l’article | Champ titre | Un seul H1, dans le Hero |
| Présentation | Champ description | Chapeau sous le titre |
| Auteur, durée, accès, couverture | Champs existants | En-tête commun |
| Introduction | PARAGRAPH | Première lettre mise en avant, comme la référence |
| Grande partie | HEADING, level 2 | Titre éditorial avec espace avant |
| Sous-partie | HEADING, level 3 | Titre plus discret, en capitales |
| Développement | PARAGRAPH | Texte courant gris, rythme partagé |
| Énumération | BULLET_LIST | Liste à puces |
| Étapes successives | NUMBERED_LIST | Liste numérotée |
| Citation | QUOTE | Encadré existant |
| Illustration | IMAGE | Image et légende, si disponibles |
| Sources | H2 puis paragraphes/liens ou liste | En fin de texte, si présentes |

L’introduction et le nombre de parties dépendent de chaque article. Aucune obligation d’ajouter une citation, une image ou des sous-parties à un texte court. Les composants existants gèrent déjà les liens de partage et la suite du parcours.

L’éditeur des ressources propose déjà les niveaux de titres et les deux types de listes : les utiliser pour les nouveaux articles. Ne pas choisir « Titre » pour une simple phrase de transition ou une invitation à prendre rendez-vous.

## Ce qui a été harmonisé

Le catalogue source contient 25 ressources ARTICLE : 22 articles développés et 3 fiches courtes. L’article de référence possède déjà sa hiérarchie. Les 21 autres articles développés ont été examinés ; des règles explicites restaurent les sous-titres, les listes et les phrases importées comme titres, selon leur structure propre. Les fiches courtes restent simples.

Tous utilisent ResourceBlocks et la même feuille de styles. Le modèle conserve la typographie, les lettrines et les surfaces de la référence. Les textes longs et les URL peuvent revenir à la ligne sur mobile. Les titres du corps sont noirs et le texte courant utilise --grey-dark. Le fichier global.scss fourni n’a pas été modifié.

## Fonctionnement pour les articles déjà en base

Aucune migration ni commande de peuplement à exécuter. La correction s’applique dans le front, après réception d’un article accessible. Les données enregistrées restent intactes : textes, ordre, liens, auteur, dates, accès et recommandations sont conservés.

- `apps/web/src/content/article-layouts.json` contient les règles relues article par article.
- `prepareArticleBlocks` reconnaît chaque import par son premier titre (ou les deux premiers titres pour les variantes connues de l’import V3) et applique uniquement des correspondances de texte exactes.
- Une liste n’est regroupée que si la totalité des paragraphes consécutifs correspond à la séquence attendue. Un passage modifié reste tel quel.
- Les listes déjà structurées et les nouveaux articles hors catalogue utilisent directement le modèle de blocs, sans déduction automatique d’après la longueur du texte.
- Si un titre d’ancrage est renommé, mettre à jour la règle correspondante ou structurer directement les blocs dans l’éditeur. Les règles ciblées restent prioritaires tant que leurs textes correspondent ; retirer une règle si une nouvelle structure éditoriale remplace celle-ci.
- Les vidéos, podcasts et autres formats ne reçoivent pas les adaptations des anciens articles.
- Le verrouillage des contenus privés reste inchangé : le modèle ne récupère aucun contenu supplémentaire.

## Limites éditoriales conservées

Certains imports contiennent encore des doublons, des libellés de formulaires ou de boutons, des mentions d’images sans image associée et des références incomplètes. Ils sont conservés pour éviter de supprimer du contenu ou d’inventer une destination. La mise en page ne remplace pas leur révision éditoriale. Aucun texte de santé n’a été réécrit ou validé scientifiquement dans cette intervention.

Aucun nouveau texte de démonstration n’a été ajouté aux articles. Pour les prochains ajouts éditoriaux de recette, conserver les caractères ** au début et à la fin comme convenu.

## Vérification

Tests automatisés de conservation du texte, des liens, de l’ordre et des données source sur les 25 articles, stabilité lors d’un second passage, respect de l’article de référence, maintien des contenus modifiés et rendu des listes avec liens. Tests existants d’accès privé conservés.

Résultat : 105 tests front réussis, lint et compilation de production réussis. Contrôle Chromium à 390 et 1440 px sur la référence et trois articles représentatifs, sans débordement horizontal. Contrôle du verrouillage privé avec API simulée.
