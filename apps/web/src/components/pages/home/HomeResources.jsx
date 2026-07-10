import { Link } from "react-router-dom";

import { homeContent } from "../../../content/home.content.js";

import ResourceCard from "../../ui/ResourceCard.jsx";

import "../../../styles/components/pages/home/home-resources.scss";

export default function HomeResources() {
  const { resources } = homeContent;

  const publishedResources = resources.items
    .filter((resource) => resource.isPublished)
    .sort((a, b) => a.order - b.order);

  return (
    <section className="home-resources page-section">
      <div className="page-container">
        <div className="home-resources__header">
          <span className="eyebrow">{resources.eyebrow}</span>

          <h2>{resources.title}</h2>

          <p>{resources.description}</p>
        </div>

        <div className="home-resources__grid">
          {publishedResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>

        <div className="home-resources__action">
          <Link to={resources.action.to} className="btn btn-primary">
            {resources.action.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
