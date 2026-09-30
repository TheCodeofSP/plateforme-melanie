import { Link } from "react-router-dom";

import ResourceAccessBadge from "./ResourceAccessBadge.jsx";
import ResourceCover from "./ResourceCover.jsx";
import {
  formatDate,
  formatResource,
  resourceActionLabel,
  resourcePath,
} from "../utils/resource-display.utils.js";

export default function ApiResourceCard({ resource }) {
  const item = formatResource(resource);
  const isPrivate =
    item.visibility === "MEMBERS_ONLY" || item.finalVisibility === "MEMBERS_ONLY" || item.locked;

  return (
    <article className="api-resource-card">
      <ResourceCover
        media={item.content.coverMedia}
        url={item.content.coverUrl}
        alt={item.content.coverAlt || ""}
        format={item.format}
      />
      <div className="api-resource-card__body">
        <div className="api-resource-card__meta">
          <span className="api-resource-card__format">
            <span aria-hidden="true">{item.format.icon}</span>
            {item.format.label}
          </span>
          <ResourceAccessBadge isPrivate={isPrivate} />
        </div>
        <h3>
          <Link to={resourcePath(item.slug)}>{item.title}</Link>
        </h3>
        <p>{item.description}</p>
        <div className="api-resource-card__footer">
          {item.publishedAt && (
            <time dateTime={new Date(item.publishedAt).toISOString()}>
              {formatDate(item.publishedAt)}
            </time>
          )}
          <Link className="api-resource-card__action" to={resourcePath(item.slug)}>
            {resourceActionLabel(item.content.format)}
          </Link>
        </div>
      </div>
    </article>
  );
}
