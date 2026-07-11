import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { homeContent } from "../../../content/home.content.js";

export default function HomeCarousel() {
  const { resources, resourcesCarousel } = homeContent;

  const carouselItems = resourcesCarousel.resourceSlugs
    .map((slug) => resources.items.find((resource) => resource.slug === slug))
    .filter((resource) => resource?.isPublished);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (carouselItems.length <= 1) {
      return undefined;
    }

    const interval = setInterval(() => {
      setActiveIndex((currentIndex) =>
        currentIndex === carouselItems.length - 1 ? 0 : currentIndex + 1,
      );
    }, resourcesCarousel.autoplayDelay);

    return () => clearInterval(interval);
  }, [carouselItems.length, resourcesCarousel.autoplayDelay]);

  const activeResource = carouselItems[activeIndex];
  const hasMultipleItems = carouselItems.length > 1;

  if (!activeResource) {
    return null;
  }

  function goToPrevious() {
    setActiveIndex((currentIndex) =>
      currentIndex === 0 ? carouselItems.length - 1 : currentIndex - 1,
    );
  }

  function goToNext() {
    setActiveIndex((currentIndex) =>
      currentIndex === carouselItems.length - 1 ? 0 : currentIndex + 1,
    );
  }

  return (
    <section className="home-carousel page-section">
      <div className="page-container home-carousel__container">
        <div className="section-header">
          <span className="eyebrow">{resourcesCarousel.eyebrow}</span>

          <h2>{resourcesCarousel.title}</h2>

          <p>{resourcesCarousel.description}</p>
        </div>

        <div className="home-carousel__slider">
          {hasMultipleItems && (
            <button
              type="button"
              className="home-carousel__arrow home-carousel__arrow--left"
              onClick={goToPrevious}
              aria-label="Afficher la ressource précédente"
            >
              <span aria-hidden="true">‹</span>
            </button>
          )}

          <article className="home-carousel__card">
            <div className="home-carousel__image">
              {activeResource.image && (
                <img
                  src={activeResource.image.src}
                  alt={activeResource.image.alt}
                />
              )}
            </div>

            <div className="home-carousel__content">
              <div className="home-carousel__meta">
                <span
                  className="home-carousel__type"
                  title={activeResource.type.label}
                  aria-label={activeResource.type.label}
                >
                  {activeResource.type.icon}
                </span>

                <span className="home-carousel__category">
                  {activeResource.category}
                </span>
              </div>

              <h3>{activeResource.title}</h3>

              <p>{activeResource.description}</p>

              <Link to={activeResource.cta.to} className="btn btn-soft">
                {activeResource.cta.label}
              </Link>
            </div>
          </article>

          {hasMultipleItems && (
            <button
              type="button"
              className="home-carousel__arrow home-carousel__arrow--right"
              onClick={goToNext}
              aria-label="Afficher la ressource suivante"
            >
              <span aria-hidden="true">›</span>
            </button>
          )}
        </div>

        {hasMultipleItems && (
          <div
            className="home-carousel__controls"
            aria-label="Changer de ressource"
          >
            {carouselItems.map((resource, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={resource.id}
                  type="button"
                  className={
                    isActive
                      ? "home-carousel__dot home-carousel__dot--active"
                      : "home-carousel__dot"
                  }
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Afficher ${resource.title}`}
                  aria-current={isActive ? "true" : undefined}
                />
              );
            })}
          </div>
        )}

        <div className="home-carousel__action">
          <Link to={resourcesCarousel.action.to} className="btn btn-primary">
            {resourcesCarousel.action.label}
          </Link>
        </div>
      </div>
    </section>
  );
}