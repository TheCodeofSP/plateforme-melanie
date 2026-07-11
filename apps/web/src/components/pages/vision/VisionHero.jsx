import { visionContent } from "../../../content/vision.content.js";

export default function VisionHero() {
  const { hero } = visionContent;

  return (
    <section className="page-hero">
      <div className="page-container vision-hero__container">
        <span className="eyebrow">{hero.badge}</span>

        <h1 className="page-title">{hero.title}</h1>

        <p className="page-intro">{hero.subtitle}</p>
      </div>
    </section>
  );
}
