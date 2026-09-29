import { recetteContent } from "../../content/recette.content.js";
import "../../styles/components/pages/recette-section.scss";

export default function RecetteSection({ page }) {
  const content = recetteContent[page];
  if (!content) return null;
  return (
    <section className="recette-section">
      <div className="page-container">
        <header className="recette-section__header">
          <p className="eyebrow">{content.eyebrow}</p>
          <h2>{content.title}</h2>
          <p>{content.text}</p>
        </header>

      </div>
    </section>
  );
}
