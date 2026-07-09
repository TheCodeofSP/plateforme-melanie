import { Link } from "react-router-dom";

import { homeContent } from "../../../content/home.content.js";

import OfferCard from "../../ui/OfferCard.jsx";

import "../../../styles/components/pages/home/home-offers.scss";

export default function HomeOffers() {
  const { offers } = homeContent;

  const publishedOffers = offers.items
    .filter((offer) => offer.isPublished)
    .sort((a, b) => a.order - b.order);

  return (
    <section className="home-offers page-section">
      <div className="page-container">
        <div className="home-offers__header">
          <span className="section-eyebrow">{offers.eyebrow}</span>

          <h2>{offers.title}</h2>

          <p>{offers.description}</p>
        </div>

        <div className="home-offers__grid">
          {publishedOffers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>

        <div className="home-offers__action">
          <Link to={offers.action.to} className="btn btn-primary">
            {offers.action.label}
          </Link>
        </div>
      </div>
    </section>
  );
}