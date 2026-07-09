import { Link } from "react-router-dom";

import "../../styles/components/pages/ui/resource-card.scss";

export default function ResourceCard({
  resource,
  showDate = false,
  showBadge = false,
}) {
  const typeClass = resource.type.id;

  const formattedDate = resource.publishedAt
    ? new Date(resource.publishedAt).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <article className={`resource-card resource-card--${typeClass}`}>
      <div className="resource-card__meta">
        <div className="resource-card__header">
          <span
            className="resource-card__type icons"
            title={resource.type.label}
            aria-label={resource.type.label}
          >
            {resource.type.icon}
          </span>
          <span>{resource.category}</span>
        </div>
        {showBadge && resource.isNew && (
          <span className="resource-card__badge">Nouveau</span>
        )}
      </div>

      {showDate && formattedDate && (
        <p className="resource-card__date">{formattedDate}</p>
      )}

      <h3>{resource.title}</h3>

      <p>{resource.description}</p>

      <Link to={resource.cta.to} className="resource-card__link">
        {resource.cta.label}
      </Link>
    </article>
  );
}
