import { Link } from "react-router-dom";

import { accompanimentsContent } from "../../../content/accompaniments.content.js";

export default function AccompanimentsCta() {
  const { cta } = accompanimentsContent;

  return (
    <section className="accompaniments-cta">
      <div className="page-container accompaniments-cta__container">
        <h2>{cta.title}</h2>
        <p>{cta.text}</p>

        <Link to={cta.primary.href} className="btn btn-primary">
          {cta.primary.label}
        </Link>
      </div>
    </section>
  );
}