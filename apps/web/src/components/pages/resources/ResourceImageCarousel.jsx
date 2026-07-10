import { useEffect, useState } from "react";

import "../../../styles/components/pages/resources/resource-image-carousel.scss";

export default function ResourceImageCarousel({ images }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) {
      return;
    }

    const intervalId = setInterval(() => {
      setActiveIndex((currentIndex) =>
        currentIndex === images.length - 1 ? 0 : currentIndex + 1,
      );
    }, 3500);

    return () => clearInterval(intervalId);
  }, [images]);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="resource-image-carousel">
      <img
        src={images[activeIndex].src}
        alt={images[activeIndex].alt}
        loading="lazy"
      />

      {images.length > 1 && (
        <div
          className="resource-image-carousel__dots"
          aria-label="Images de la ressource"
        >
          {images.map((image, index) => (
            <button
              key={image.src}
              className={`resource-image-carousel__dot ${
                activeIndex === index ? "resource-image-carousel__dot--active" : ""
              }`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Afficher l’image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}