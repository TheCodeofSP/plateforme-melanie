import { accompanimentsContent } from "../../../content/accompaniments.content.js";

export default function AccompanimentsIntro() {
  const { introduction } = accompanimentsContent;

  return (
    <section className="accompaniments-intro">
      <div className="page-container accompaniments-intro__container">
        <h2>{introduction.title}</h2>

        <div className="accompaniments-intro__content">
          {introduction.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}