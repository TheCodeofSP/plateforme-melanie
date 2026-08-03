import SEO from "../components/seo/SEO.jsx";
import { termsContent } from "../content/terms.content.js";

import "../styles/pages/legal.scss";

export default function TermsPage() {
  return (
    <>
      <SEO title={termsContent.title} description="Conditions d’utilisation de la plateforme." />
      <main className="legal-page">
        <article>
          <p className="section-eyebrow">{termsContent.eyebrow}</p>
          <h1>{termsContent.title}</h1>
          <p className="legal-page__notice">{termsContent.notice}</p>
          {termsContent.sections.map((section) => <section key={section.title}><h2>{section.title}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}
        </article>
      </main>
    </>
  );
}
