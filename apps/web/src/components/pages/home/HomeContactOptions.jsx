import { Link } from "react-router-dom";

import { homeContent } from "../../../content/home.content.js";

import ContactOptionCard from "../../ui/ContactOptionCard.jsx";

import "../../../styles/components/pages/home/home-contact-options.scss";

export default function HomeContactOptions() {
  const { contactOptions } = homeContent;

  const options = contactOptions.items
    .filter((item) => item.isEnabled)
    .sort((a, b) => a.order - b.order);

  return (
    <section className="home-contact page-section">
      <div className="page-container">
        <div className="home-contact__header">
          <span className="section-eyebrow">
            {contactOptions.eyebrow}
          </span>

          <h2>{contactOptions.title}</h2>

          <p>{contactOptions.description}</p>
        </div>

        <div className="home-contact__grid">
          {options.map((option) => (
            <ContactOptionCard
              key={option.id}
              option={option}
            />
          ))}
        </div>

        <div className="home-contact__action">
          <Link
            to={contactOptions.action.to}
            className="btn btn-primary"
          >
            {contactOptions.action.label}
          </Link>
        </div>
      </div>
    </section>
  );
}