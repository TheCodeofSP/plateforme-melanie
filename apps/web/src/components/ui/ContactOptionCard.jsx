import { Link } from "react-router-dom";

import "../../styles/components/pages/ui/contact-option-card.scss";

export default function ContactOptionCard({ option }) {
  const content = (
    <>
      <span className="contact-option-card__icon">
        {option.icon}
      </span>

      <h3>{option.title}</h3>

      <p>{option.description}</p>

      <span className="contact-option-card__link">
        {option.cta}
      </span>
    </>
  );

  if (option.external) {
    return (
      <a
        href={option.href}
        className="contact-option-card"
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      to={option.href}
      className="contact-option-card"
    >
      {content}
    </Link>
  );
}