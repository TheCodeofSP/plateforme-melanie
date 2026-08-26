import { Link } from "react-router-dom";

import { routes } from "../config/routes.config.js";
import useAuth from "../hooks/useAuth.js";

import "../styles/pages/member-home.scss";

export default function MemberHome() {
  const { user } = useAuth();
  const hasQuiz = Boolean(user?.quizCompleted);

  return (
    <main className="member-home">
      <header>
        <p className="eyebrow">Mon espace</p>
        <h1>Bienvenue dans ton espace personnel</h1>
        <p>
          Choisis le prochain pas qui te ressemble. Tu peux faire une pause,
          explorer un repère ou demander à être accompagné·e.
        </p>
      </header>
      <section className="member-home__quiz">
        <span aria-hidden="true">{hasQuiz ? "✦" : "?"}</span>
        <div>
          <p className="eyebrow">Le Quiz SPM</p>
          <h2>{hasQuiz ? "Ton profil t’attend" : "Découvre ton profil SPM"}</h2>
          <p>
            {hasQuiz
              ? "Retrouve ton portrait actuel, les ressources recommandées et l’évolution de tes résultats."
              : "Quelques minutes pour mettre des mots sur ce que tu vis avant tes règles."}
          </p>
          <div>
            <Link
              className="btn btn-primary"
              to={hasQuiz ? routes.memberQuizResult : routes.quizQuestions}
            >
              {hasQuiz ? "Voir mon profil actuel" : "Faire le quiz"}
            </Link>
            {hasQuiz && (
              <Link className="btn btn-secondary" to={routes.memberQuizHistory}>
                Consulter mon historique
              </Link>
            )}
          </div>
        </div>
      </section>
      <section className="member-home__quiz member-home__quiz--guidance">
        <span aria-hidden="true">↗</span>
        <div>
          <p className="eyebrow">Aller un peu plus loin</p>
          <h2>Faire un point avec Mélanie</h2>
          <p>
            Si tu ressens le besoin d’un cadre plus personnel, tu peux présenter
            ta situation et découvrir l’accompagnement le plus adapté à ton
            chemin.
          </p>
          <div>
            <Link
              className="btn btn-primary"
              to={`${routes.contact}?intention=accompagnement`}
            >
              Parler de mon besoin
            </Link>
            <Link className="btn btn-secondary" to={routes.accompaniments}>
              Voir les accompagnements
            </Link>
          </div>
        </div>
      </section>
      <section className="member-home__quiz">
        <span aria-hidden="true">◇</span>
        <div>
          <p className="eyebrow">Partager ton expertise</p>
          <h2>Devenir intervenante</h2>
          <p>
            Prépare un dossier professionnel à ton rythme et transmets-le à
            Mélanie lorsque tu es prête.
          </p>
          <div>
            <Link
              className="btn btn-primary"
              to={routes.memberIntervenantApplication}
            >
              Préparer ma demande
            </Link>
            <Link
              className="btn btn-secondary"
              to={routes.memberIntervenantApplicationStatus}
            >
              Suivre mes demandes
            </Link>
          </div>
        </div>
      </section>
      <section className="member-home__quiz">
        <span aria-hidden="true">◌</span>
        <div>
          <p className="eyebrow">Rendez-vous en ligne</p>
          <h2>Mes webinaires</h2>
          <p>
            Retrouve tes prochaines rencontres, tes questions et les replays
            disponibles.
          </p>
          <Link className="btn btn-primary" to={routes.myWebinars}>
            Voir mes webinaires
          </Link>
        </div>
      </section>
      <section className="member-home__quiz">
        <span aria-hidden="true">⌁</span>
        <div>
          <p className="eyebrow">Espace communautaire</p>
          <h2>Entrer dans le forum de La Clairière</h2>
          <p>
            Un espace calme et confidentiel pour déposer ce que tu traverses et
            échanger sous ton pseudonyme.
          </p>
          <Link className="btn btn-primary" to={routes.community}>
            Rejoindre le forum
          </Link>
        </div>
      </section>
    </main>
  );
}
