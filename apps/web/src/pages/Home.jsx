import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiBookOpen,
  FiChevronLeft,
  FiChevronRight,
  FiMessageCircle,
  FiShield,
  FiUsers,
} from "react-icons/fi";

import SEO from "../components/seo/SEO.jsx";
import { homeContent } from "../content/home.content.js";
import { seoContent } from "../content/seo.content.js";
import logo from "../assets/images/logo-clairiere.png";
import melaniePortrait from "../assets/images/melanie-portrait-optimized.jpg";
import newsletterPreview from "../assets/images/ressources/ebook.png";
import cyclePreview from "../assets/images/ressources/roue-du-cycle.png";
import podcastPreview from "../assets/images/ressources/podcast-melanie.png";
import quizPreview from "../assets/images/ressources/quiz-spm.png";
import videoPreview from "../assets/images/ressources/video-youtube-melanie.png";

import "../styles/pages/home-premium.scss";

const resourcePreviews = {
  quiz: quizPreview,
  cycle: cyclePreview,
  video: videoPreview,
  podcast: podcastPreview,
  newsletter: newsletterPreview,
};

const articlePreviews = [
  "/images/articles/fatigue-chronique-pourquoi-dormir-8-heures-ne-suffit-pas-toujours-fatigue-chronique.png",
  "/images/articles/la-gyn-ecologie-emotionnelle-la-gyn-ecologie-emotionelle1.png",
  "/images/articles/musique-et-emotions-musique-et-emotions.png",
];

const clairiereIcons = [FiShield, FiBookOpen, FiMessageCircle, FiUsers];

function ResourcePreview({ item, mobile = false }) {
  if (item.preview === "article") {
    return (
      <span
        className={`home-story__article-preview${mobile ? " home-story__article-preview--mobile" : ""}`}
        aria-hidden="true"
      >
        {articlePreviews.map((src) => (
          <img src={src} alt="" loading="lazy" key={src} />
        ))}
      </span>
    );
  }
  return (
    <img
      className={mobile ? "home-story__resource-mobile-preview" : undefined}
      src={resourcePreviews[item.preview]}
      alt={mobile ? "" : `Aperçu : ${item.title}`}
      loading="lazy"
    />
  );
}

function ResourceStoryCard({ item }) {
  const [flipped, setFlipped] = useState(false);

  function handleClick(event) {
    if (
      window.matchMedia("(hover: none), (pointer: coarse)").matches &&
      !flipped
    ) {
      event.preventDefault();
      setFlipped(true);
    }
  }

  return (
    <Link
      className={`home-story__resource-card home-story__resource-card--${item.tone}${flipped ? " is-flipped" : ""}`}
      to={item.to}
      onClick={handleClick}
    >
      <span className="home-story__resource-card-inner">
        <span className="home-story__resource-face home-story__resource-face--front">
          <span className="home-story__resource-meta">
            <span>{item.label}</span>
            <small>{item.access}</small>
          </span>
          <h3>{item.title}</h3>
          <p>{item.text}</p>
          <ResourcePreview item={item} mobile />
        </span>
        <span className="home-story__resource-face home-story__resource-face--back">
          <ResourcePreview item={item} />
          <span aria-hidden="true">Voir le contenu</span>
        </span>
      </span>
    </Link>
  );
}

function EmphasizedText({ text, phrases }) {
  const pattern = new RegExp(
    `(${phrases.map((phrase) => phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi",
  );
  return text
    .split(pattern)
    .map((part, index) =>
      phrases.some((phrase) => phrase.toLowerCase() === part.toLowerCase()) ? (
        <strong key={`${part}-${index}`}>{part}</strong>
      ) : (
        part
      ),
    );
}

export default function Home() {
  const resourceSliderRef = useRef(null);
  const [sliderPosition, setSliderPosition] = useState({
    left: false,
    right: true,
  });

  const updateSliderPosition = useCallback(() => {
    const slider = resourceSliderRef.current;
    if (!slider) return;
    setSliderPosition({
      left: slider.scrollLeft > 4,
      right: slider.scrollLeft + slider.clientWidth < slider.scrollWidth - 4,
    });
  }, []);

  function scrollResources(direction) {
    resourceSliderRef.current?.scrollBy({
      left: direction * resourceSliderRef.current.clientWidth * 0.8,
      behavior: "smooth",
    });
  }

  useEffect(() => {
    updateSliderPosition();
    window.addEventListener("resize", updateSliderPosition);
    return () => window.removeEventListener("resize", updateSliderPosition);
  }, [updateSliderPosition]);

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
              {homeContent.hero.introduction.map((paragraph, index) => (
                <p
                  className={index === 0 ? "home-story__conditions" : undefined}
                  key={paragraph}
                >
                  {index === 0 ? <strong>{paragraph}</strong> : paragraph}
                </p>
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
            <svg
              className="home-story__cloud-path home-story__cloud-path--desktop"
              viewBox="0 0 1200 430"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                className="home-story__cloud-trail"
                d="M20 345 C170 410 280 400 385 330 S610 300 700 365 S960 415 1180 325"
              />
              <path
                className="home-story__cloud-route"
                d="M20 345 C170 410 280 400 385 330 S610 300 700 365 S960 415 1180 325"
              />
            </svg>
            <svg
              className="home-story__cloud-path home-story__cloud-path--mobile"
              viewBox="0 0 360 1160"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                className="home-story__cloud-trail"
                d="M180 15 C70 130 285 225 178 350 C75 470 285 575 180 700 C75 825 280 930 175 1145"
              />
              <path
                className="home-story__cloud-route"
                d="M180 15 C70 130 285 225 178 350 C75 470 285 575 180 700 C75 825 280 930 175 1145"
              />
            </svg>
            {homeContent.paths.items.map((item) => (
              <div className="home-story__path-stop" key={item.title}>
                <a
                  className={`home-story__path-card${item.featured ? " home-story__path-card--featured" : ""}`}
                  href={item.action.to}
                  aria-label={`${item.title} — ${item.action.label}`}
                >
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <strong>{item.details}</strong>
                </a>
                <span className="home-story__card-cloud" aria-hidden="true" />
              </div>
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

          <div className="home-story__resource-slider-shell">
            <button
              className="home-story__slider-arrow home-story__slider-arrow--left"
              type="button"
              aria-label="Voir les ressources précédentes"
              disabled={!sliderPosition.left}
              onClick={() => scrollResources(-1)}
            >
              <FiChevronLeft aria-hidden="true" />
            </button>
            <div
              ref={resourceSliderRef}
              className="home-story__resource-slider"
              aria-label="Ressources pour faire ses premiers pas"
              onScroll={updateSliderPosition}
            >
              {homeContent.firstSteps.items.map((item) => (
                <ResourceStoryCard item={item} key={item.title} />
              ))}
            </div>
            <button
              className="home-story__slider-arrow home-story__slider-arrow--right"
              type="button"
              aria-label="Voir les ressources suivantes"
              disabled={!sliderPosition.right}
              onClick={() => scrollResources(1)}
            >
              <FiChevronRight aria-hidden="true" />
            </button>
          </div>

          <div className="home-story__first-steps-footer">
            <blockquote className="home-story__citation">
              <img src={logo} alt="" aria-hidden="true" />
              <p>« {homeContent.firstSteps.conclusion} »</p>
            </blockquote>
          </div>
        </div>
      </section>

      <section className="home-story__forum" id="forum">
        <div className="page-container home-story__forum-card">
          <div>
            <p className="eyebrow">{homeContent.forum.eyebrow}</p>
            <h2>{homeContent.forum.title}</h2>
            <div className="home-story__paragraphs">
              {homeContent.forum.introduction.map((paragraph, index) => (
                <p
                  className={
                    index === 0 ? "home-story__forum-trigger" : undefined
                  }
                  key={paragraph}
                >
                  {paragraph}
                </p>
              ))}
            </div>
            <strong className="home-story__forum-highlight">
              {homeContent.forum.highlight}
            </strong>
            <p>{homeContent.forum.text}</p>
            <div className="home-story__forum-benefits">
              {homeContent.forum.benefits.map((benefit, index) => {
                const Icon = clairiereIcons[index];
                return (
                  <div key={benefit.title}>
                    <Icon aria-hidden="true" />
                    <p>
                      <strong>{benefit.title}</strong> — {benefit.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="home-story__forum-action">
            <Link className="btn btn-primary" to={homeContent.forum.action.to}>
              {homeContent.forum.action.label}
            </Link>
          </div>
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
            <blockquote className="home-story__melanie-highlight">
              <p>« {homeContent.melanie.highlight} »</p>
            </blockquote>
            <Link
              className="btn btn-primary"
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
              {homeContent.accompaniments.paragraphs.map((paragraph, index) => (
                <p key={paragraph}>
                  <EmphasizedText
                    text={paragraph}
                    phrases={
                      index === 0
                        ? [
                            "prendre du recul seule",
                            "faire des liens",
                            "apaiser ta douleur",
                            "problème gynécologique",
                          ]
                        : [
                            "ensemble",
                            "leviers de transformation",
                            "mieux comprendre ton fonctionnement",
                            "ton propre chemin",
                          ]
                    }
                  />
                </p>
              ))}
            </div>
          </header>

          <div className="home-story__offer-grid">
            {homeContent.accompaniments.items.map((item) => (
              <Link to={item.to} key={item.title}>
                <span className="home-story__offer-number">{item.number}</span>
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
