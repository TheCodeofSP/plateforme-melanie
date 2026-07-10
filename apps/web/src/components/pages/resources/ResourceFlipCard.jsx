import { Link } from "react-router-dom";

import "../../../styles/components/pages/resources/resource-flip-card.scss";

import Badge from "../../ui/Badge.jsx";
import Tag from "../../ui/Tag.jsx";

export default function ResourceFlipCard({ resource }) {
  const CardLink = resource.isExternal ? "a" : Link;

  const linkProps = resource.isExternal
    ? {
        href: resource.url,
        target: "_blank",
        rel: "noopener noreferrer",
      }
    : {
        to: resource.url,
      };

  return (
    <CardLink className="resource-flip-card" {...linkProps}>
      <article className="resource-flip-card__inner">
        <div className="resource-flip-card__face resource-flip-card__face--front">
          <div className="resource-flip-card__media">
            {resource.badge && (
              <div className="resource-flip-card__badge">
                <Badge variant={resource.badge.variant}>
                  {resource.badge.label}
                </Badge>
              </div>
            )}

            <img
              className="resource-flip-card__image"
              src={resource.cover}
              alt={resource.alt}
            />
          </div>

          <div className="resource-flip-card__content">
            <span className="resource-flip-card__type">
              <span aria-hidden="true">{resource.type.icon}</span>
              {resource.type.label}
            </span>

            <Tag>{resource.category}</Tag>

            <h3>{resource.title}</h3>

            <span className="btn btn-primary resource-flip-card__cta">
              {resource.ctaLabel}
              <span aria-hidden="true">{resource.ctaIcon}</span>
            </span>
          </div>
        </div>

        <div className="resource-flip-card__face resource-flip-card__face--back">
          <div className="resource-flip-card__content resource-flip-card__content--back">
            <span className="resource-flip-card__type">
              <span aria-hidden="true">{resource.type.icon}</span>
              {resource.category}
            </span>

            <p>{resource.description}</p>

            {resource.meta && (
              <span className="resource-flip-card__meta">
                {resource.type.id === "article"
                  ? `Temps de lecture : ${resource.meta}`
                  : resource.meta}
              </span>
            )}

            <span className="btn btn-secondary resource-flip-card__cta">
              {resource.ctaLabel}
              <span aria-hidden="true">{resource.ctaIcon}</span>
            </span>
          </div>
        </div>
      </article>
    </CardLink>
  );
}
