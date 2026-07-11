import { Link } from "react-router-dom";

export default function ContactOptionCard({ option }) {
  const content = (
    <>
      <span className="contact-option-card__icon" aria-hidden="true">
        {option.icon}
      </span>

      <div className="contact-option-card__content">
        <h3 className="contact-option-card__title">{option.title}</h3>

        <p className="contact-option-card__description">
          {option.description}
        </p>
      </div>

      <span className="contact-option-card__link">
        {option.cta}

        <span aria-hidden="true">→</span>
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
    <Link to={option.href} className="contact-option-card">
      {content}
    </Link>
  );
}