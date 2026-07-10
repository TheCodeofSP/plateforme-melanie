import Badge from "../../ui/Badge.jsx";
import Tag from "../../ui/Tag.jsx";

import ResourceImageCarousel from "./ResourceImageCarousel.jsx";

import "../../../styles/components/pages/resources/resource-detail-header.scss";

export default function ResourceDetailHeader({ resource }) {
  const images =
    resource.gallery && resource.gallery.length > 1
      ? resource.gallery
      : [
          {
            src: resource.cover,
            alt: resource.alt,
          },
        ];

  return (
    <header className="resource-detail-header">
      <div className="page-container resource-detail-header__container">
        <div className="resource-detail-header__content">
          <span className="eyebrow">
            {resource.type.icon} {resource.type.label}
          </span>

          <h1>{resource.title}</h1>

          <p>{resource.description}</p>

          <div className="resource-detail-header__meta">
            <Tag>{resource.category}</Tag>

            {resource.meta && resource.type.id === "article" && (
              <span>Temps de lecture : {resource.meta}</span>
            )}

            {resource.meta && resource.type.id !== "article" && (
              <span>{resource.meta}</span>
            )}
          </div>

          {resource.badge && (
            <Badge variant={resource.badge.variant}>
              {resource.badge.label}
            </Badge>
          )}
        </div>

        <div className="resource-detail-header__image">
          <ResourceImageCarousel images={images} />
        </div>
      </div>
    </header>
  );
}