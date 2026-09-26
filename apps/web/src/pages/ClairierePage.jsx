import { Link } from "react-router-dom";

import SEO from "../components/seo/SEO.jsx";
import { routes } from "../config/routes.config.js";
import { clairiereContent } from "../content/clairiere.content.js";
import logo from "../assets/images/logo-clairiere.png";

import "../styles/pages/editorial-premium.scss";

export default function ClairierePage() {
  return (
    <main id="main-content" className="editorial-page editorial-page--clearing">
      <SEO
        title="La Clairière — Un espace privé pour ne plus avancer seule"
        description={clairiereContent.hero.text}
        url={routes.platform}
      />
      <section className="editorial-hero">
        <div className="page-container editorial-hero__grid">
          <div>
            <p className="eyebrow">{clairiereContent.hero.eyebrow}</p>
            <h1>{clairiereContent.hero.title}</h1>
            <p>{clairiereContent.hero.text}</p>
            <Link className="btn btn-primary" to={routes.registration}>
              Créer gratuitement mon espace
            </Link>
          </div>
          <img src={logo} alt="Logo officiel de La Clairière" />
        </div>
      </section>
      <section className="editorial-section" id="origine">
        <div className="page-container editorial-copy">
          <h2>{clairiereContent.meaning.title}</h2>
          {clairiereContent.meaning.paragraphs.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </section>
      <section className="editorial-section editorial-section--accent" id="besoins">
        <div className="page-container">
          <h2>{clairiereContent.reasons.title}</h2>
          <ul className="editorial-checks">
            {clairiereContent.reasons.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
      <section className="editorial-section" id="espaces">
        <div className="page-container">
          <header className="section-header">
            <p className="eyebrow">À l’intérieur de La Clairière</p>
            <h2>Un espace pour approfondir et échanger.</h2>
          </header>
          <div className="editorial-card-grid">
            {clairiereContent.spaces.map((item) => (
              <Link to={item.to} key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="editorial-section editorial-section--warm" id="engagements">
        <div className="page-container editorial-copy">
          <h2>Les engagements de La Clairière</h2>
          <ul className="editorial-checks">
            {clairiereContent.commitments.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="editorial-actions">
            <Link className="btn btn-primary" to={routes.registration}>
              Entrer dans La Clairière
            </Link>
            <Link className="btn btn-secondary" to={routes.contact}>
              Poser une question
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
