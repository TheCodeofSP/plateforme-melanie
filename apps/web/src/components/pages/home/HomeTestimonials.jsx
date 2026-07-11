import { homeContent } from "../../../content/home.content.js";

import TestimonialCard from "../../ui/TestimonialCard.jsx";

export default function HomeTestimonials() {
  const { testimonials } = homeContent;

  const publishedTestimonials = testimonials.items
    .filter((item) => item.status === "published")
    .sort((a, b) => a.order - b.order);

  if (publishedTestimonials.length === 0) {
    return null;
  }

  return (
    <section className="home-testimonials page-section">
      <div className="page-container home-testimonials__container">
        <div className="section-header">
          <span className="eyebrow">{testimonials.eyebrow}</span>

          <h2>{testimonials.title}</h2>

          <p>{testimonials.description}</p>

          {testimonials.note && (
            <small className="home-testimonials__note">
              {testimonials.note}
            </small>
          )}
        </div>

        <div className="home-testimonials__grid">
          {publishedTestimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
            />
          ))}
        </div>
      </div>
    </section>
  );
}