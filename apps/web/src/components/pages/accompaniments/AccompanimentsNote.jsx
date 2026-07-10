import { accompanimentsContent } from "../../../content/accompaniments.content.js";

export default function AccompanimentsNote() {
  const { note } = accompanimentsContent;

  return (
    <section className="accompaniments-note">
      <div className="page-container accompaniments-note__container">
        <h2>{note.title}</h2>
        <p>{note.text}</p>
      </div>
    </section>
  );
}