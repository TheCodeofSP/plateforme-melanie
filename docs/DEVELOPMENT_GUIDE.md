# Guide de développement — Plateforme Mélanie

## 1. Méthode générale

Le projet doit rester scalable, clair et maintenable.

Une PB contenant du back et du front sera toujours traitée dans cet ordre :

1. Analyse de la PB
2. Backend
3. Tests backend
4. Frontend
5. Tests frontend
6. Validation finale

## 2. Architecture backend

Flux obligatoire :

Route → Controller → Service → Model → MongoDB

Règles :

- aucune logique métier dans les routes ;
- aucune requête MongoDB directe dans les controllers ;
- la logique métier va dans les services ;
- les models décrivent uniquement la structure des données.

## 3. Architecture frontend

Une page assemble des composants.

Exemple :

```jsx
export default function About() {
  return (
    <main className="about-page">
      <AboutHeader />
      <AboutStory />
      <AboutValues />
    </main>
  );
}

Règles :

une page ne doit pas devenir un fichier fourre-tout ;
un bloc d’interface réutilisable devient un composant ;
les appels API passent par services/ ;
les textes statiques passent par content/.
4. Convention de nommage
Composants React

PascalCase obligatoire :

HomeHeader.jsx
AboutStory.jsx
ContactForm.jsx
AdminSidebar.jsx
ClassName CSS

kebab-case obligatoire :

home-header
about-story
contact-form
admin-sidebar
5. Structure HTML

Chaque page doit utiliser une structure sémantique :

<main>
  <header></header>
  <section></section>
  <section></section>
</main>

Les div sont utilisées uniquement quand elles servent au layout.

6. SCSS

Tous les styles doivent passer par :

variables
mixins
reset
global
layouts
components
pages

Règles :

pas de couleur en dur dans les pages ;
pas de media query écrite directement si un mixin existe ;
pas de duplication inutile ;
les composants réutilisables ont un style réutilisable.
7. Design System

Les éléments communs doivent être centralisés :

Button
Card
Input
Textarea
Select
Badge
Modal
Loader
EmptyState
Alert
8. Philosophie du projet

On ne code pas seulement pour que ça marche.

On code pour que ce soit lisible, maintenable et évolutif dans un an.
```

Convention d'import

Afin de garantir la compatibilité avec Vite, Vercel et de faciliter la lecture du projet :

les imports utilisent toujours le nom complet du fichier ;
les extensions sont toujours précisées (.js, .jsx, .scss) ;
les fichiers SCSS n'utilisent pas le préfixe _.

Exemple :

import Navigation from "../components/layout/Navigation.jsx";
import "../styles/main.scss";
import { homeContent } from "../content/home.content.js";
@use "../abstracts/mixins.scss";
@use "../design-system/buttons.scss";