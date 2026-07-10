import { homeContent } from "../../../content/home.content.js";

import TestimonialCard from "../../ui/TestimonialCard.jsx";

import "../../../styles/components/pages/home/home-testimonials.scss";
import "../../../styles/components/pages/ui/testimonial-card.scss";

export default function HomeTestimonials() {
  const { testimonials } = homeContent;

  const publishedTestimonials = testimonials.items
    .filter((item) => item.status === "published")
    .sort((a, b) => a.order - b.order);

  return (
    <section className="home-testimonials page-section">
      <div className="page-container">
        <div className="home-testimonials__header">
          <span className="eyebrow">{testimonials.eyebrow}</span>

          <h2>{testimonials.title}</h2>

          <p>{testimonials.description}</p>

          <small>{testimonials.note}</small>
        </div>

        <div className="home-testimonials__grid">
          {publishedTestimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}
