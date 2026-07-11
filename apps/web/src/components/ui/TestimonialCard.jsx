export default function TestimonialCard({ testimonial }) {
  return (
    <article className="testimonial-card">
      <span className="testimonial-card__quote" aria-hidden="true">
        “
      </span>

      <blockquote className="testimonial-card__text">
        {testimonial.text}
      </blockquote>

      <footer className="testimonial-card__footer">
        <strong className="testimonial-card__name">
          {testimonial.name}
        </strong>

        <span className="testimonial-card__context">
          {testimonial.context}
        </span>
      </footer>
    </article>
  );
}