import { Link } from "react-router-dom";

import "../../styles/components/pages/ui/recommended-resource-card.scss";

export default function RecommendedResourceCard({
  recommendation,
  content,
  index,
}) {
  return (
    <article className="recommended-resource-card">
      <div className="recommended-resource-card__header">
        <span className="recommended-resource-card__number">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="recommended-resource-card__label">
          {recommendation.label}
        </span>
      </div>

      <div className="recommended-resource-card__content">
        <div className="recommended-resource-card__meta">
          <span title={content.type.label} aria-label={content.type.label}>
            {content.type.icon}
          </span>
          <h3>{content.title}</h3>
        </div>

        <p>{content.description}</p>

        <p className="recommended-resource-card__reason">
          {recommendation.reason}
        </p>

        <Link to={content.cta.to} className="recommended-resource-card__link">
          {content.cta.label}
        </Link>
      </div>
    </article>
  );
}
