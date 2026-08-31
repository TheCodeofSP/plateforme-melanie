import { Link } from "react-router-dom";

import SEO from "../components/seo/SEO.jsx";
import { homeContent } from "../content/home.content.js";
import { seoContent } from "../content/seo.content.js";
import logo from "../assets/images/logo-clairiere.png";
import melaniePortrait from "../assets/images/melanie-portrait-optimized.jpg";

import "../styles/pages/home-premium.scss";

export default function Home() {
  return (
    <main id="main-content" className="home-story">
      <SEO
        {...seoContent.pages.home}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "La Clairière",
          description: seoContent.pages.home.description,
        }}
      />

      <section className="home-story__hero">
        <div className="page-container home-story__hero-grid">
          <div className="home-story__copy">
            <p className="eyebrow">{homeContent.hero.eyebrow}</p>
            <h1>{homeContent.hero.title}</h1>
            <div className="home-story__paragraphs">
              {homeContent.hero.introduction.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <strong className="home-story__hero-highlight">
              {homeContent.hero.highlight}
            </strong>
            <p>{homeContent.hero.conclusion}</p>
          </div>

          <div className="home-story__logo">
            <span aria-hidden="true">Une lumière apparaît sur le chemin</span>
            <img
              src={logo}
              alt="Logo officiel de La Clairière"
              fetchPriority="high"
            />
          </div>
        </div>
      </section>

      <section className="home-story__paths">
        <div className="page-container">
          <header className="section-header">
            <p className="eyebrow">{homeContent.paths.eyebrow}</p>
            <h2>{homeContent.paths.title}</h2>
          </header>

          <div className="home-story__path-grid">
            {homeContent.paths.items.map((item) => (
              <article
                className={`home-story__path-card${item.featured ? " home-story__path-card--featured" : ""}`}
                key={item.title}
              >
                {item.featured && (
                  <span className="home-story__path-featured">
                    Le cœur de La Clairière
                  </span>
                )}
                <span className="home-story__path-number">{item.number}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <strong>{item.details}</strong>
                <a className="btn btn-secondary" href={item.action.to}>
                  {item.action.label}
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-story__first-steps" id="premiers-pas">
        <div className="page-container">
          <header className="home-story__section-intro">
            <p className="eyebrow">{homeContent.firstSteps.eyebrow}</p>
            <h2>{homeContent.firstSteps.title}</h2>
            <div className="home-story__paragraphs">
              <p>{homeContent.firstSteps.introduction}</p>
              <p>{homeContent.firstSteps.invitation}</p>
              <p>{homeContent.firstSteps.description}</p>
            </div>
            <p className="home-story__access-information">
              {homeContent.firstSteps.accessInformation}
            </p>
          </header>

          <div
            className="home-story__resource-slider"
            aria-label="Ressources pour faire ses premiers pas"
          >
            {homeContent.firstSteps.items.map((item) => (
              <Link
                className={`home-story__resource-card home-story__resource-card--${item.tone}`}
                to={item.to}
                key={item.title}
              >
                <div className="home-story__resource-meta">
                  <span>{item.label}</span>
                  <small>{item.access}</small>
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <strong>Découvrir →</strong>
              </Link>
            ))}
          </div>

          <div className="home-story__first-steps-footer">
            <p className="home-story__citation">
              <q>{homeContent.firstSteps.conclusion}</q>
            </p>

            <Link
              className="btn btn-primary"
              to={homeContent.firstSteps.action.to}
            >
              {homeContent.firstSteps.action.label}
            </Link>
          </div>
        </div>
      </section>

      <section className="home-story__forum" id="forum">
        <div className="page-container home-story__forum-card">
          <div>
            <p className="eyebrow">{homeContent.forum.eyebrow}</p>
            <h2>{homeContent.forum.title}</h2>
            <span className="home-story__status">
              {homeContent.forum.status}
            </span>
            <p>{homeContent.forum.text}</p>
          </div>
          <Link className="btn btn-primary" to={homeContent.forum.action.to}>
            {homeContent.forum.action.label}
          </Link>
        </div>
      </section>

      <section className="home-story__melanie">
        <div className="page-container home-story__melanie-grid">
          <figure>
            <img
              src={melaniePortrait}
              alt="Portrait de Mélanie Dizet"
              loading="lazy"
            />
            <figcaption>Mélanie Dizet · coach et accompagnante</figcaption>
          </figure>

          <div>
            <p className="eyebrow">{homeContent.melanie.eyebrow}</p>
            <h2>{homeContent.melanie.title}</h2>
            <div className="home-story__paragraphs">
              {homeContent.melanie.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <strong className="home-story__melanie-highlight">
              {homeContent.melanie.highlight}
            </strong>
            <Link
              className="btn btn-secondary"
              to={homeContent.melanie.action.to}
            >
              {homeContent.melanie.action.label}
            </Link>
          </div>
        </div>
      </section>

      <section className="home-story__accompaniments" id="accompagnements">
        <div className="page-container">
          <header className="home-story__section-intro">
            <p className="eyebrow">{homeContent.accompaniments.eyebrow}</p>
            <h2>{homeContent.accompaniments.title}</h2>
            <div className="home-story__paragraphs">
              {homeContent.accompaniments.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </header>

          <div className="home-story__offer-grid">
            {homeContent.accompaniments.items.map((item) => (
              <Link to={item.to} key={item.title}>
                <div className="home-story__offer-labels">
                  {item.labels.map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <strong className="home-story__offer-ideal">
                  {item.ideal}
                </strong>
                <span className="home-story__offer-link">Découvrir →</span>
              </Link>
            ))}
          </div>

          <div className="home-story__accompaniments-action">
            <Link
              className="btn btn-primary"
              to={homeContent.accompaniments.action.to}
            >
              {homeContent.accompaniments.action.label}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
