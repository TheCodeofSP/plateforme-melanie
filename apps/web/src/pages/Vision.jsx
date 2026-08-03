import { Link } from "react-router-dom";

import SEO from "../components/seo/SEO.jsx";
import { routes } from "../config/routes.config.js";
import { melanieContent } from "../content/melanie.content.js";
import portrait from "../assets/images/melanie-portrait-optimized.jpg";
import logo from "../assets/images/logo-clairiere.png";

import "../styles/pages/editorial-premium.scss";

export default function Vision() {
  return <main id="main-content" className="editorial-page editorial-page--melanie"><SEO title="Mélanie Dizet — Coach et accompagnante" description={melanieContent.hero.text} url={routes.vision} /><section className="editorial-hero"><div className="page-container editorial-hero__grid"><div><p className="eyebrow">{melanieContent.hero.eyebrow}</p><h1>{melanieContent.hero.title}</h1><p>{melanieContent.hero.text}</p></div><img className="editorial-portrait" src={portrait} alt="Portrait de Mélanie Dizet" /></div></section><section className="editorial-section"><div className="page-container editorial-split"><div><h2>{melanieContent.story.title}</h2>{melanieContent.story.paragraphs.map((item) => <p key={item}>{item}</p>)}</div><blockquote>« Ce que j’ai appris sur mon propre chemin, j’ai choisi de le transmettre sans jamais imposer une direction. »</blockquote></div></section><section className="editorial-section editorial-section--accent"><div className="page-container editorial-hero__grid"><img src={logo} alt="" /><div><h2>{melanieContent.clearing.title}</h2>{melanieContent.clearing.paragraphs.map((item) => <p key={item}>{item}</p>)}<Link className="btn btn-secondary" to={routes.platform}>Découvrir La Clairière</Link></div></div></section><section className="editorial-section"><div className="page-container editorial-split"><div><p className="eyebrow">Parcours et formations</p><h2>Une approche nourrie par l’expérience et l’apprentissage.</h2></div><ul className="editorial-checks">{melanieContent.training.map((item) => <li key={item}>{item}</li>)}</ul></div></section><section className="editorial-section editorial-section--warm"><div className="page-container editorial-copy"><h2>Un cadre clair et respectueux.</h2><p>{melanieContent.limits}</p><div className="editorial-actions"><Link className="btn btn-primary" to={routes.accompaniments}>Découvrir les accompagnements</Link><Link className="btn btn-secondary" to={routes.contact}>Échanger avec Mélanie</Link></div></div></section></main>;
}
