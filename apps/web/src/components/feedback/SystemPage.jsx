import { Link } from "react-router-dom";

import { routes } from "../../config/routes.config.js";

import "../../styles/pages/system-page.scss";

export default function SystemPage({
  eyebrow,
  title,
  description,
  actionLabel = "Revenir à l’accueil",
  actionTo = routes.home,
}) {
  return (
    <main className="system-page">
      <section className="system-page__card">
        <p className="section-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
        <Link className="btn btn-primary" to={actionTo}>
          {actionLabel}
        </Link>
      </section>
    </main>
  );
}
