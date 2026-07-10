import { homeContent } from "../../../content/home.content.js";

import RecommendedResourceCard from "../../ui/RecommendedResourceCard.jsx";

import "../../../styles/components/pages/home/home-recommended-resources.scss";

export default function HomeRecommendedResources() {
  const { resources, recommendedResources } = homeContent;

  const recommendations = recommendedResources.items
    .filter((item) => item.isActive)
    .sort((a, b) => a.order - b.order)
    .map((recommendation) => {
      const resource = resources.items.find(
        (item) => item.slug === recommendation.resourceSlug,
      );

      return {
        recommendation,
        content: recommendation.customContent || resource,
      };
    })
    .filter((item) => item.content);

  return (
    <section className="home-recommended-resources page-section">
      <div className="page-container">
        <div className="home-recommended-resources__header">
          <span className="eyebrow">{recommendedResources.eyebrow}</span>

          <h2>{recommendedResources.title}</h2>

          <p>{recommendedResources.description}</p>
        </div>

        <div className="home-recommended-resources__list">
          {recommendations.map((item, index) => (
            <RecommendedResourceCard
              key={item.recommendation.id}
              recommendation={item.recommendation}
              content={item.content}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
