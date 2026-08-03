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
      <SEO {...seoContent.pages.home} structuredData={{ "@context": "https://schema.org", "@type": "WebSite", name: "La Clairière", description: seoContent.pages.home.description }} />

      <section className="home-story__hero">
        <div className="page-container home-story__hero-grid">
          <div className="home-story__copy">
            <p className="eyebrow">{homeContent.hero.eyebrow}</p>
            <h1>{homeContent.hero.title}</h1>
            <p>{homeContent.hero.introduction}</p>
            <div className="home-story__actions"><Link className="btn btn-primary" to={homeContent.hero.primary.to}>{homeContent.hero.primary.label}</Link><Link className="btn btn-secondary" to={homeContent.hero.secondary.to}>{homeContent.hero.secondary.label}</Link></div>
          </div>
          <div className="home-story__logo"><span aria-hidden="true">Une lumière apparaît sur le chemin</span><img src={logo} alt="Logo officiel de La Clairière : une personne s’élève entre un nuage, une étoile et une lune" fetchPriority="high" /></div>
        </div>
      </section>

      <section className="home-story__recognition">
        <div className="page-container home-story__narrow">
          <p className="eyebrow">{homeContent.recognition.eyebrow}</p>
          <h2>{homeContent.recognition.title}</h2>
          {homeContent.recognition.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <strong>{homeContent.recognition.reassurance}</strong>
        </div>
      </section>

      <section className="home-story__pause">
        <div className="page-container home-story__pause-card">
          <div className="home-story__path" aria-hidden="true"><i /><i /><i /></div>
          <div><p className="eyebrow">{homeContent.pause.eyebrow}</p><h2>{homeContent.pause.title}</h2><p>{homeContent.pause.text}</p></div>
        </div>
      </section>

      <section className="home-story__experiences">
        <div className="page-container">
          <header className="section-header"><p className="eyebrow">{homeContent.experiences.eyebrow}</p><h2>{homeContent.experiences.title}</h2></header>
          <div className="home-story__experience-grid">{homeContent.experiences.items.map((item) => <article key={item.title}><span>{item.symbol}</span><h3>{item.title}</h3><p>{item.text}</p><Link to={item.to}>{item.label}<span aria-hidden="true"> →</span></Link></article>)}</div>
        </div>
      </section>

      <section className="home-story__melanie">
        <div className="page-container home-story__melanie-grid">
          <figure><img src={melaniePortrait} alt="Portrait de Mélanie Dizet" loading="lazy" /><figcaption>Mélanie Dizet · coach et accompagnante</figcaption></figure>
          <div><p className="eyebrow">{homeContent.melanie.eyebrow}</p><h2>{homeContent.melanie.title}</h2><p>{homeContent.melanie.text}</p><p>{homeContent.melanie.details}</p><Link className="btn btn-secondary" to={homeContent.melanie.to}>{homeContent.melanie.label}</Link></div>
        </div>
      </section>

      <section className="home-story__accompaniments">
        <div className="page-container">
          <header className="section-header"><p className="eyebrow">{homeContent.accompaniments.eyebrow}</p><h2>{homeContent.accompaniments.title}</h2><p>{homeContent.accompaniments.text}</p></header>
          <div className="home-story__offer-grid">{homeContent.accompaniments.items.map((item) => <Link to={item.to} key={item.title}><span>{item.meta}</span><h3>{item.title}</h3><p>{item.text}</p><strong>Découvrir cet accompagnement →</strong></Link>)}</div>
        </div>
      </section>

      <section className="home-story__final">
        <div className="page-container"><p className="eyebrow">{homeContent.final.eyebrow}</p><h2>{homeContent.final.title}</h2><p>{homeContent.final.text}</p><div className="home-story__actions"><Link className="btn btn-primary" to={homeContent.final.primary.to}>{homeContent.final.primary.label}</Link><Link className="btn btn-secondary" to={homeContent.final.secondary.to}>{homeContent.final.secondary.label}</Link></div></div>
      </section>
    </main>
  );
}
