import { Link } from "react-router-dom";

import "../../../styles/components/pages/resources/resource-article-pagination.scss";

export default function ResourceArticlePagination({
  previousResource,
  nextResource,
}) {
  if (!previousResource && !nextResource) {
    return null;
  }

  return (
    <nav
      className="resource-article-pagination"
      aria-label="Navigation entre les articles"
    >
      {previousResource ? (
        <Link
          to={previousResource.url}
          className="resource-article-pagination__link resource-article-pagination__link--previous"
        >
          <span>← Article précédent</span>
          <strong>{previousResource.title}</strong>
        </Link>
      ) : (
        <span />
      )}

      {nextResource ? (
        <Link
          to={nextResource.url}
          className="resource-article-pagination__link resource-article-pagination__link--next"
        >
          <span>Article suivant →</span>
          <strong>{nextResource.title}</strong>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}