import { useEffect, useState } from "react";
import { quizProfiles } from "../config/quiz.config.js";
import useQuiz from "../features/quiz/hooks/useQuiz.js";
import { getRecommendations } from "../features/resources/api/resource.service.js";
import {
  formatResource,
  resourcePath,
} from "../features/resources/utils/resource-display.utils.js";
import { Link } from "react-router-dom";
import { routes } from "../config/routes.config.js";
import useAuth from "../hooks/useAuth.js";
import "../styles/pages/member-home.scss";

function Card({ eyebrow, icon, title, description, children }) {
  return (
    <section className="member-home__quiz">
      <span aria-hidden="true">{icon}</span>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{description}</p>
        <div>{children}</div>
      </div>
    </section>
  );
}

export default function MemberHome() {
  const { user } = useAuth();
  const { dispatch } = useQuiz();
  const profile = quizProfiles[user?.currentSpmProfile];
  const hasQuiz = Boolean(user?.quizCompleted && profile);
  const [recommendations, setRecommendations] = useState([]);
  useEffect(() => {
    if (!hasQuiz) return;
    let active = true;
    getRecommendations(3)
      .then((items) => {
        if (active) setRecommendations(items);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [hasQuiz, user?.id, user?.currentSpmProfile]);
  return (
    <main className="member-home">
      <header>
        <p className="eyebrow">Mon espace</p>
        <h1>Bienvenue dans ton espace personnel</h1>
        <p>Retrouve le forum, les ressources accessibles et les prochains rendez-vous.</p>
      </header>
      <Card
        eyebrow="Priorité 1 · Communauté"
        icon="⌁"
        title="Entrer dans le forum de La Clairière"
        description="Avant ta première entrée, tu devras lire et accepter la charte du forum. Elle pose le cadre nécessaire pour que chacune puisse partager son vécu dans un espace privé, respectueux et sécurisant."
      >
        <Link className="btn btn-primary" to={routes.community}>
          Lire la charte et découvrir le forum
        </Link>
      </Card>
      <Card
        eyebrow="Priorité 2 · Ressources"
        icon="◇"
        title={
          hasQuiz
            ? "**Trois ressources pour ton profil SPM**"
            : "Explorer les ressources réservées aux membres"
        }
        description="Ton compte te donne accès aux contenus publics, mais aussi à des articles, vidéos, podcasts et outils exclusifs pour approfondir les sujets qui te concernent."
      >
        {hasQuiz && recommendations.length > 0 && (
          <ul className="member-home__recommendations">
            {recommendations.slice(0, 3).map((resource) => {
              const item = formatResource(resource);
              return (
                <li key={item._id}>
                  <Link to={resourcePath(item.slug)}>
                    <span>{item.title}</span>
                    <small>
                      {item.format.label}
                      {item.duration ? ` · ${item.duration}` : ""}
                    </small>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <Link className="btn btn-primary" to={routes.resources}>
          Explorer toutes les ressources
        </Link>
      </Card>
      <Card
        eyebrow="Priorité 3 · Profil SPM"
        icon={hasQuiz ? "✦" : "?"}
        title={hasQuiz ? `**Ton profil SPM : ${profile.label}**` : "Découvre ton profil SPM"}
        description={
          hasQuiz
            ? "**Ce profil est un repère pour explorer ton vécu. Tu peux consulter ton portrait ou refaire le quiz si tes ressentis évoluent.**"
            : "En répondant au Quiz SPM, tu obtiendras un profil qui guidera ton parcours et permettra de te recommander des contenus en lien avec ce que tu vis."
        }
      >
        <Link
          className="btn btn-primary"
          to={routes.quizQuestions}
          onClick={() => dispatch({ type: "RESET" })}
        >
          {hasQuiz ? "**Refaire le quiz**" : "Faire le quiz"}
        </Link>
        {hasQuiz && (
          <Link className="btn btn-secondary" to={routes.memberQuizResult}>
            **Voir mon profil**
          </Link>
        )}
        {hasQuiz && (
          <Link className="btn btn-secondary" to={routes.memberQuizHistory}>
            Consulter mon historique
          </Link>
        )}
      </Card>
      <Card
        eyebrow="Priorité 4 · Rencontres"
        icon="◌"
        title="Mes ateliers et webinaires"
        description="Retrouve les prochaines rencontres, tes questions et les replays disponibles."
      >
        <Link className="btn btn-primary" to={routes.myWebinars}>
          Voir mes webinaires
        </Link>
      </Card>
      <Card
        eyebrow="Priorité 5 · Accompagnements"
        icon="↗"
        title="Faire un point avec Mélanie"
        description="Présente ta situation et découvre l’accompagnement le plus adapté."
      >
        <Link className="btn btn-primary" to={`${routes.contact}?intention=accompagnement`}>
          Parler de mon besoin
        </Link>
        <Link className="btn btn-secondary" to={routes.accompaniments}>
          Voir les accompagnements
        </Link>
      </Card>
      <Card
        eyebrow="Compte professionnel séparé"
        icon="◇"
        title="Devenir intervenante"
        description="Une intervenante suit un parcours spécifique avec une adresse professionnelle distincte de son compte personnel."
      >
        <Link className="btn btn-primary" to={routes.memberIntervenantApplication}>
          Préparer ma demande
        </Link>
        <Link className="btn btn-secondary" to={routes.memberIntervenantApplicationStatus}>
          Suivre mes demandes
        </Link>
      </Card>
    </main>
  );
}
