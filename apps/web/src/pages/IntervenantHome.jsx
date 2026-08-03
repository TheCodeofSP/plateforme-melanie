import { Link } from "react-router-dom";

import { routes } from "../config/routes.config.js";

import "../styles/pages/member-home.scss";

export default function IntervenantHome() {
  return (
    <main className="member-home">
      <header><p className="section-eyebrow">Espace intervenante</p><h1>Bienvenue dans ton espace professionnel</h1><p>Propose et suis les ressources qui accompagnent les membres de la plateforme.</p></header>
      <section><span aria-hidden="true">◇</span><div><h2>Mes ressources</h2><p>Prépare un brouillon, soumets-le à Mélanie et retrouve les éventuelles corrections demandées.</p><Link className="btn btn-primary" to={routes.intervenantResources}>Gérer mes ressources</Link></div></section>
      <section><span aria-hidden="true">✦</span><div><h2>Mon profil professionnel</h2><p>Prépare ta présentation publique ou propose une nouvelle version à Mélanie.</p><Link className="btn btn-primary" to={routes.intervenantProfile}>Gérer mon profil</Link></div></section>
      <section><span aria-hidden="true">◌</span><div><h2>Mes webinaires</h2><p>Consulte tes inscriptions, les informations pratiques et les replays disponibles.</p><Link className="btn btn-primary" to={routes.myWebinars}>Voir mes webinaires</Link></div></section>
      <section><span aria-hidden="true">↩</span><div><h2>Mon rôle d’intervenante</h2><p>Si ton engagement évolue, tu peux demander à retrouver un compte membre.</p><Link className="btn btn-secondary" to={routes.intervenantExit}>Gérer mon rôle</Link></div></section>
    </main>
  );
}
