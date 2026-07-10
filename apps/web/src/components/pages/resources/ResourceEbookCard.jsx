import "../../../styles/components/pages/resources/resource-ebook-card.scss";

export default function ResourceEbookCard({ ebook }) {
  if (!ebook) {
    return null;
  }

  return (
    <aside className="resource-ebook-card">
      <div className="resource-ebook-card__cover">
        <img
          src={ebook.cover}
          alt={`Couverture de l'e-book ${ebook.title}`}
          loading="lazy"
        />
      </div>

      <div className="resource-ebook-card__content">
        <span className="resource-ebook-card__eyebrow">
          Chapitre du guide
        </span>

        <h2>{ebook.title}</h2>

        <p className="resource-ebook-card__subtitle">
          {ebook.subtitle}
        </p>

        <p className="resource-ebook-card__chapter">
          {ebook.chapter}
        </p>

        <p>
          Cet article est directement issu de ce guide. Si tu souhaites aller
          plus loin et découvrir l'ensemble des chapitres, tu pourras bientôt
          le télécharger gratuitement.
        </p>

        {ebook.available ? (
          <a
            href={ebook.url}
            className="btn btn-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            {ebook.ctaLabel}
          </a>
        ) : (
          <button
            className="btn btn-secondary"
            type="button"
            disabled
          >
            {ebook.ctaLabel} — bientôt disponible
          </button>
        )}
      </div>
    </aside>
  );
}