import { Link } from "react-router-dom";

import { homeContent } from "../../../content/home.content.js";

import logoMelanieMobile from "../../../assets/images/quiz.png";
import logoMelanieDesktop from "../../../assets/images/quiz.png";

export default function HomeHeader() {
  const { hero } = homeContent;

  return (
    <header className="home-header">
      <div className="page-container home-header__container">
        <div className="home-header__content">
          <span className="eyebrow">{hero.eyebrow}</span>

          <div className="home-header__image home-header__image--mobile">
            <img
              src={logoMelanieMobile}
              alt="Mélanie Dizet"
              loading="eager"
              fetchPriority="high"
            />
          </div>

          <h1>{hero.title}</h1>

          <div className="home-header__introduction">
            {hero.introduction.map((paragraph) => (
              <p key={paragraph} className="home-header__subtitle">
                {paragraph}
              </p>
            ))}
          </div>

          <p className="home-header__mission">{hero.mission}</p>

          <p className="home-header__description">{hero.description}</p>

          <div className="home-header__actions">
            <Link to={hero.actions.primary.to} className="btn btn-primary">
              {hero.actions.primary.label}
            </Link>

            <Link to={hero.actions.secondary.to} className="btn btn-secondary">
              {hero.actions.secondary.label}
            </Link>
          </div>
        </div>

        <div className="home-header__image home-header__image--desktop">
          <img
            src={logoMelanieDesktop}
            alt="Mélanie Dizet"
            loading="eager"
            fetchPriority="high"
          />
        </div>
      </div>
    </header>
  );
}
