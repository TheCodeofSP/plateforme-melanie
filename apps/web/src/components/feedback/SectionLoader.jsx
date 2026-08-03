import { feedbackContent } from "../../content/feedback.content.js";

export default function SectionLoader() {
  return (
    <div className="section-loader" aria-busy="true" aria-live="polite">
      <span aria-hidden="true" />
      <p>{feedbackContent.loading.section}</p>
    </div>
  );
}
