import "../../styles/components/pages/ui/testimonial-card.scss";

export default function TestimonialCard({ testimonial }) {
  return (
    <article className="testimonial-card">
      <span className="testimonial-card__quote">“</span>

      <p>{testimonial.text}</p>

      <footer>
        <strong>{testimonial.name}</strong>
        <span>{testimonial.context}</span>
      </footer>
    </article>
  );
}