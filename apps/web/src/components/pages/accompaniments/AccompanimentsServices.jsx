import { Link } from "react-router-dom";

import { accompanimentsContent } from "../../../content/accompaniments.content.js";

import AccompanimentIcon from "./AccompanimentIcon.jsx";

export default function AccompanimentsServices() {
  const { services } = accompanimentsContent;

  return (
    <section className="accompaniments-services">
      <div className="page-container accompaniments-services__container">
        {services.map((service) => (
          <article
            className={`accompaniment-card accompaniment-card--${service.accent}`}
            key={service.id}
          >
            <div className="accompaniment-card__header">
              <AccompanimentIcon
                icon={service.icon}
                className="accompaniment-card__icon"
              />

              <p className="accompaniment-card__subtitle">{service.subtitle}</p>

              <h2>{service.title}</h2>

              <p>{service.description}</p>
            </div>

            <div className="accompaniment-card__content">
              <div>
                <h3>Pour qui ?</h3>

                <ul>
                  {service.forWho.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3>Ce que ça t’apporte</h3>

                <ul>
                  {service.benefits.map((benefit) => (
                    <li key={benefit}>{benefit}</li>
                  ))}
                </ul>
              </div>
            </div>

            <Link to={service.cta.href} className="btn btn-secondary">
              {service.cta.label}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
