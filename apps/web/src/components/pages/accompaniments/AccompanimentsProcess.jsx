import { accompanimentsContent } from "../../../content/accompaniments.content.js";

export default function AccompanimentsProcess() {
  const { process } = accompanimentsContent;

  return (
    <section className="accompaniments-process">
      <div className="page-container accompaniments-process__container">
        <header className="accompaniments-section-header">
          <h2>{process.title}</h2>
        </header>

        <div className="accompaniments-process__steps">
          {process.steps.map((step) => (
            <article className="accompaniments-step" key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}