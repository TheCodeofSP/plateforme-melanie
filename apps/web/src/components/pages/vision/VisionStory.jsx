import { visionContent } from "../../../content/vision.content.js";

export default function VisionStory() {
  const { story } = visionContent;

  return (
    <section className="vision-story">
      <div className="page-container vision-story__container">
        <h2>{story.title}</h2>

        <div className="vision-story__content">
          {story.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}