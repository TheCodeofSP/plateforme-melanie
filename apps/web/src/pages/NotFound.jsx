import SystemPage from "../components/feedback/SystemPage.jsx";
import { feedbackContent } from "../content/feedback.content.js";

export default function NotFound() {
  return <SystemPage {...feedbackContent.notFound} />;
}
