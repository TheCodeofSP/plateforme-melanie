import { Link } from "react-router-dom";

import SEO from "../components/seo/SEO.jsx";
import { routes } from "../config/routes.config.js";
import { clairiereContent } from "../content/clairiere.content.js";
import logo from "../assets/images/logo-clairiere.png";

import "../styles/pages/editorial-premium.scss";

export default function ClairierePage() {
  return <main id="main-content" className="editorial-page editorial-page--clearing"><SEO title="La Clairière — Une pause sur ton chemin" description={clairiereContent.hero.text} url={routes.platform} /><section className="editorial-hero"><div className="page-container editorial-hero__grid"><div><p className="eyebrow">{clairiereContent.hero.eyebrow}</p><h1>{clairiereContent.hero.title}</h1><p>{clairiereContent.hero.text}</p><Link className="btn btn-primary" to={routes.registration}>Créer gratuitement mon espace</Link></div><img src={logo} alt="Logo officiel de La Clairière" /></div></section><section className="editorial-section"><div className="page-container editorial-copy"><h2>{clairiereContent.meaning.title}</h2>{clairiereContent.meaning.paragraphs.map((item) => <p key={item}>{item}</p>)}</div></section><section className="editorial-section editorial-section--accent"><div className="page-container"><h2>{clairiereContent.reasons.title}</h2><ul className="editorial-checks">{clairiereContent.reasons.items.map((item) => <li key={item}>{item}</li>)}</ul></div></section><section className="editorial-section"><div className="page-container"><header className="section-header"><p className="eyebrow">Choisir son premier pas</p><h2>Quatre manières de faire une pause.</h2></header><div className="editorial-card-grid">{clairiereContent.spaces.map((item) => <Link to={item.to} key={item.title}><h3>{item.title}</h3><p>{item.text}</p><strong>Découvrir →</strong></Link>)}</div></div></section><section className="editorial-section editorial-section--warm"><div className="page-container editorial-copy"><h2>Les engagements de La Clairière</h2><ul className="editorial-checks">{clairiereContent.commitments.map((item) => <li key={item}>{item}</li>)}</ul><div className="editorial-actions"><Link className="btn btn-primary" to={routes.registration}>Entrer dans La Clairière</Link><Link className="btn btn-secondary" to={routes.contact}>Poser une question</Link></div></div></section></main>;
}
