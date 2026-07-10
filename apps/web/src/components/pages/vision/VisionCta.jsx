import { Link } from "react-router-dom";

import { visionContent } from "../../../content/vision.content.js";

export default function VisionCta() {
  const { cta } = visionContent;

  return (
    <section className="vision-cta">
      <div className="page-container vision-cta__container">
        <h2>{cta.title}</h2>
        <p>{cta.text}</p>

        <div className="vision-cta__actions">
          <Link to={cta.primary.href} className="btn btn-primary">
            {cta.primary.label}
          </Link>

          <Link to={cta.secondary.href} className="btn btn-secondary">
            {cta.secondary.label}
          </Link>
        </div>
      </div>
    </section>
  );
}