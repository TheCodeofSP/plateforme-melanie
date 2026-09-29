import { formatDate } from "../utils/resource-display.utils.js";

export default function ResourceAuthorByline({ author, duration, publishedAt }) {
  const name = author?.name || "Mélanie";
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <aside className="resource-author" aria-label={`Ressource proposée par ${name}`}>
      <span className="resource-author__portrait" aria-hidden="true">
        {initial}
      </span>
      <div>
        <p className="resource-author__label">Une ressource proposée par</p>
        <p className="resource-author__name">{name}</p>
        <p className="resource-author__details">
          {duration}
          {publishedAt && ` · Publiée le ${formatDate(publishedAt)}`}
        </p>
      </div>
    </aside>
  );
}
