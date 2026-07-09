import { Link } from "react-router-dom";

import { homeContent } from "../../../content/home.content.js";

import ResourceCard from "../../ui/ResourceCard.jsx";

import "../../../styles/components/pages/home/home-latest-resources.scss";

export default function HomeLatestResources() {
  const { resources, latestResources } = homeContent;

  const latestPublishedResources = resources.items
    .filter((resource) => resource.isPublished)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, latestResources.limit);

  return (
    <section className="home-latest-resources page-section">
      <div className="page-container">
        <div className="home-latest-resources__header">
          <span className="section-eyebrow">{latestResources.eyebrow}</span>

          <h2>{latestResources.title}</h2>

          <p>{latestResources.description}</p>
        </div>

        <div className="home-latest-resources__list">
          {latestPublishedResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} showDate />
          ))}
        </div>

        <div className="home-latest-resources__action">
          <Link to={latestResources.action.to} className="btn btn-secondary">
            {latestResources.action.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
