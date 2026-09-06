import { Link } from "react-router-dom";

import ResourceCover from "./ResourceCover.jsx";
import { formatDate, formatResource, resourcePath } from "../utils/resource-display.utils.js";

export default function ApiResourceCard({ resource }) {
  const item = formatResource(resource);
  return (
    <article className="api-resource-card">
      <ResourceCover media={item.content.coverMedia} url={item.content.coverUrl} alt={item.content.coverAlt || ""} format={item.format} />
      <div className="api-resource-card__body">
        <div className="api-resource-card__meta">
          <span>{item.format.icon} {item.format.label}</span>
          {item.locked && <span className="resource-access">Réservée aux membres</span>}
        </div>
        <h3><Link to={resourcePath(item.slug)}>{item.title}</Link></h3>
        <p>{item.description}</p>
        <div className="api-resource-card__footer">
          <span>{item.author?.name || "Mélanie"}</span>
          <span>{item.duration || formatDate(item.publishedAt)}</span>
        </div>
      </div>
    </article>
  );
}
