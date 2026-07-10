import { visionContent } from "../../../content/vision.content.js";

export default function VisionValues() {
  const { values } = visionContent;

  return (
    <section className="vision-values">
      <div className="page-container vision-values__container">
        <header className="vision-section-header">
          <h2>{values.title}</h2>
        </header>

        <div className="vision-values__grid">
          {values.items.map((value) => (
            <article className="vision-value-card" key={value.title}>
              <span className="vision-value-card__icon" aria-hidden="true">
                {value.icon}
              </span>

              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}