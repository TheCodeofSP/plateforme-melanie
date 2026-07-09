import { Link } from "react-router-dom";

import "../../styles/components/pages/ui/offer-card.scss";

export default function OfferCard({ offer }) {
  return (
    <article className="offer-card">
      <div className="offer-card__meta">
        <span>{offer.duration}</span>
        <span>{offer.format}</span>
      </div>

      <h3>{offer.title}</h3>

      <p className="offer-card__description">{offer.shortDescription}</p>

      <p className="offer-card__benefit">{offer.benefit}</p>

      <Link to={offer.cta.to} className="btn btn-secondary">
        {offer.cta.label}
      </Link>
    </article>
  );
}