import { Link } from "react-router-dom";

export default function OfferCard({ offer }) {
  return (
    <article className="offer-card">
      <div className="offer-card__meta">
        <span className="offer-card__tag">{offer.duration}</span>
        <span className="offer-card__tag">{offer.format}</span>
      </div>

      <div className="offer-card__content">
        <h3>{offer.title}</h3>

        <p className="offer-card__description">{offer.shortDescription}</p>

        <p className="offer-card__benefit">{offer.benefit}</p>
      </div>

      <Link to={offer.cta.to} className="btn btn-secondary">
        {offer.cta.label}
      </Link>
    </article>
  );
}