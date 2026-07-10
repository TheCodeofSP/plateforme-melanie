import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { homeContent } from "../../../content/home.content.js";

import "../../../styles/components/pages/home/home-carousel.scss";

export default function HomeCarousel() {
  const { resources, resourcesCarousel } = homeContent;

  const carouselItems = resourcesCarousel.resourceSlugs
    .map((slug) => resources.items.find((resource) => resource.slug === slug))
    .filter((resource) => resource && resource.isPublished);

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
        <div className="home-carousel__header">
          <span className="eyebrow">{resourcesCarousel.eyebrow}</span>

          <h2>{resourcesCarousel.title}</h2>

          <p>{resourcesCarousel.description}</p>
        </div>

        <div className="home-carousel__slider">
          <button
            type="button"
            className="home-carousel__arrow home-carousel__arrow--left"
            onClick={goToPrevious}
            aria-label="Afficher la ressource précédente"
          >
            ‹
          </button>

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
                  title={activeResource.type.label}
                  aria-label={activeResource.type.label}
                >
                  {activeResource.type.icon}
                </span>

                <span>{activeResource.category}</span>
              </div>

              <h3>{activeResource.title}</h3>

              <p>{activeResource.description}</p>

              <Link to={activeResource.cta.to} className="btn btn-primary">
                {activeResource.cta.label}
              </Link>
            </div>
          </article>
          <button
            type="button"
            className="home-carousel__arrow home-carousel__arrow--right"
            onClick={goToNext}
            aria-label="Afficher la ressource suivante"
          >
            ›
          </button>
        </div>

        <div
          className="home-carousel__controls"
          aria-label="Changer de ressource"
        >
          {carouselItems.map((resource, index) => (
            <button
              key={resource.id}
              type="button"
              className={
                index === activeIndex
                  ? "home-carousel__dot home-carousel__dot--active"
                  : "home-carousel__dot"
              }
              onClick={() => setActiveIndex(index)}
              aria-label={`Afficher ${resource.title}`}
            />
          ))}
        </div>

        <div className="home-carousel__action">
          <Link to={resourcesCarousel.action.to} className="btn btn-secondary">
            {resourcesCarousel.action.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
