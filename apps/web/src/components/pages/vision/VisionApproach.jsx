import { visionContent } from "../../../content/vision.content.js";

export default function VisionApproach() {
  const { approach } = visionContent;

  return (
    <section className="vision-approach">
      <div className="page-container vision-approach__container">
        <header className="section-header">
          <h2>{approach.title}</h2>
          <p>{approach.description}</p>
        </header>

        <div className="vision-approach__grid">
          {approach.pillars.map((pillar) => (
            <article className="vision-card" key={pillar.title}>
              <span className="vision-card__icon" aria-hidden="true">
                {pillar.icon}
              </span>

              <h3>{pillar.title}</h3>
              <p>{pillar.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}