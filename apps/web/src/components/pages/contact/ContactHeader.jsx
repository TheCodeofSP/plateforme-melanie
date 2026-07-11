import { contactContent } from "../../../content/contact.content.js";

export default function ContactHeader() {
  const { hero } = contactContent;

  return (
    <header className="page-hero">
      <span className="eyebrow">{hero.eyebrow}</span>

      <h1 className="page-title">{hero.title}</h1>

      {hero.introduction.map((paragraph) => (
        <p className="page-intro" key={paragraph}>{paragraph}</p>
      ))}
    </header>
  );
}
