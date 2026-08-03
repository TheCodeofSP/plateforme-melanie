import { Link } from "react-router-dom";

import SEO from "../components/seo/SEO.jsx";
import { routes } from "../config/routes.config.js";
import { accompanimentsContent } from "../content/accompaniments.content.js";

import "../styles/pages/editorial-premium.scss";

export default function Accompaniments() {
  return <main id="main-content" className="editorial-page editorial-page--offers"><SEO title="Accompagnements avec Mélanie Dizet" description={accompanimentsContent.hero.text} url={routes.accompaniments} /><section className="editorial-hero"><div className="page-container editorial-copy"><p className="eyebrow">{accompanimentsContent.hero.eyebrow}</p><h1>{accompanimentsContent.hero.title}</h1><p>{accompanimentsContent.hero.text}</p></div></section><section className="editorial-section"><div className="page-container"><header className="section-header"><p className="eyebrow">Choisir selon ton besoin</p><h2>Trois façons d’être accompagné·e.</h2></header><div className="editorial-offer-grid">{accompanimentsContent.choices.map((item) => <article key={item.id}><span>{item.meta}</span><h3>{item.title}</h3><p>{item.need}</p><Link className="btn btn-secondary" to={item.to}>Découvrir</Link></article>)}</div></div></section><section className="editorial-section editorial-section--accent"><div className="page-container editorial-copy"><h2>Tu ne sais pas encore lequel choisir ?</h2><p>Tu n’as pas besoin d’arriver avec une réponse. Le formulaire de contact permet simplement de décrire ce que tu traverses et de demander un premier échange.</p><Link className="btn btn-primary" to={`${routes.contact}?intention=accompagnement`}>Parler de mon besoin</Link></div></section><aside className="page-container editorial-note"><strong>Un accompagnement complémentaire</strong><p>{accompanimentsContent.note}</p></aside></main>;
}
