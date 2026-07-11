import { Link, useParams } from "react-router-dom";

import SEO from "../components/seo/SEO.jsx";
import ResourceDetailHeader from "../components/pages/resources/ResourceDetailHeader.jsx";
import ResourceDetailContent from "../components/pages/resources/ResourceDetailContent.jsx";
import ResourceDetailNavigation from "../components/pages/resources/ResourceDetailNavigation.jsx";
import ResourceRelatedList from "../components/pages/resources/ResourceRelatedList.jsx";

import { resourcesContent } from "../content/resources.content.js";

import "../styles/pages/resource-detail.scss";

export default function ResourceDetail() {
  const { resourceId } = useParams();

  const resource = resourcesContent.resources.find(
    (item) => item.id === resourceId,
  );

  const currentIndex = resource
    ? resourcesContent.resources.findIndex((item) => item.id === resource.id)
    : -1;

  const previousResource =
    currentIndex > 0 ? resourcesContent.resources[currentIndex - 1] : null;

  const nextResource =
    currentIndex >= 0 && currentIndex < resourcesContent.resources.length - 1
      ? resourcesContent.resources[currentIndex + 1]
      : null;

  const relatedResources = resource?.relatedResourceIds
    ? resourcesContent.resources.filter((item) =>
        resource.relatedResourceIds.includes(item.id),
      )
    : [];

  if (!resource || !resource.body) {
    return (
      <main className="page-content resource-detail-page">
        <section className="resource-detail-page__not-found page-container">
          <h1>Ressource introuvable</h1>
          <p>Cette ressource n’existe pas ou n’est pas encore disponible.</p>

          <Link to="/resources" className="btn btn-primary">
            Retour aux ressources
          </Link>
        </section>
      </main>
    );
  }

  return (
    <>
      <SEO
        title={`${resource.title} — Mélanie Dizet`}
        description={resource.description}
        url={resource.url}
      />

      <main className="resource-detail-page">
        <ResourceDetailHeader resource={resource} />

        <ResourceDetailContent
          resource={resource}
          previousResource={previousResource}
          nextResource={nextResource}
        />

        <ResourceRelatedList resources={relatedResources} />

        <ResourceDetailNavigation />
      </main>
    </>
  );
}