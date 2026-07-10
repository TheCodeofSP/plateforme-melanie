import { contactContent } from "../../../content/contact.content.js";

export default function ContactHeader() {
  const { hero } = contactContent;

  return (
    <header className="contact-header">
      <span className="eyebrow">{hero.eyebrow}</span>

      <h1>{hero.title}</h1>

      {hero.introduction.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </header>
  );
}
