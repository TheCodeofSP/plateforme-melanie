import { visionContent } from "../../../content/vision.content.js";

export default function VisionTraining() {
  const { training } = visionContent;

  return (
    <section className="vision-training">
      <div className="page-container vision-training__container">
        <div className="vision-training__content">
          <h2>{training.title}</h2>
          <p>{training.description}</p>
        </div>

        <ul className="vision-training__list">
          {training.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}