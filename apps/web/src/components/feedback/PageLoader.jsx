import { feedbackContent } from "../../content/feedback.content.js";

import "../../styles/components/feedback/page-loader.scss";

export default function PageLoader() {
  return (
    <main className="page-loader" aria-busy="true" aria-live="polite">
      <span className="page-loader__mark" aria-hidden="true" />
      <p>{feedbackContent.loading.page}</p>
    </main>
  );
}
