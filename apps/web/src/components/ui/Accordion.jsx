import { useState } from "react";

import "../../styles/components/pages/ui/accordion.scss";

export default function Accordion({ title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <article className="accordion">
      <button
        type="button"
        className="accordion__button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
      >
        <span>{title}</span>

        <span
          className={`accordion__icon ${
            isOpen ? "accordion__icon--open" : ""
          }`}
        >
          +
        </span>
      </button>

      <div
        className={`accordion__content ${
          isOpen ? "accordion__content--open" : ""
        }`}
      >
        <div className="accordion__inner">
          <div className="accordion__body">{children}</div>
        </div>
      </div>
    </article>
  );
}