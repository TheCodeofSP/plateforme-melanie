import { visionContent } from "../../../content/vision.content.js";

export default function VisionConvictions() {
  const { vision } = visionContent;

  return (
    <section className="vision-convictions">
      <div className="page-container vision-convictions__container">
        <header className="section-header">
          <h2>{vision.title}</h2>
          <p>{vision.description}</p>
        </header>

        <div className="vision-convictions__grid">
          {vision.convictions.map((conviction) => (
            <article className="vision-card" key={conviction.title}>
              <span className="vision-card__icon" aria-hidden="true">
                {conviction.icon}
              </span>

              <h3>{conviction.title}</h3>
              <p>{conviction.description}</p>
            </article>
          ))}
        </div>

        <blockquote className="vision-convictions__quote">
          {vision.quote}
        </blockquote>
      </div>
    </section>
  );
}