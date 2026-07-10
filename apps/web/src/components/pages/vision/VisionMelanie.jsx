import { visionContent } from "../../../content/vision.content.js";

export default function VisionMelanie() {
  const { melanie } = visionContent;

  return (
    <section className="vision-melanie">
      <div className="page-container vision-melanie__container">
        <div className="vision-melanie__aside">
          <figure className="vision-melanie__image">
            <img src={melanie.image.src} alt={melanie.image.alt} />
          </figure>
        </div>
        <div className="vision-melanie__content">
          <h2>{melanie.title}</h2>

          <div className="vision-melanie__text">
            {melanie.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <blockquote className="vision-melanie__quote">
          {melanie.quote}
        </blockquote>
      </div>
    </section>
  );
}
