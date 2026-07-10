import { visionContent } from "../../../content/vision.content.js";

export default function VisionHero() {
  const { hero } = visionContent;

  return (
    <section className="vision-hero">
      <div className="page-container vision-hero__container">
        <p className="eyebrow">{hero.badge}</p>

        <h1>{hero.title}</h1>

        <p className="vision-hero__subtitle">{hero.subtitle}</p>
      </div>
    </section>
  );
}