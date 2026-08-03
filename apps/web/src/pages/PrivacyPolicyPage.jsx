import SEO from "../components/seo/SEO.jsx";
import { privacyPolicyContent } from "../content/privacy-policy.content.js";

import "../styles/pages/legal.scss";

export default function PrivacyPolicyPage() {
  return (
    <>
      <SEO title={privacyPolicyContent.title} description="Informations sur l’utilisation des données personnelles." />
      <main className="legal-page">
        <article>
          <p className="section-eyebrow">{privacyPolicyContent.eyebrow}</p>
          <h1>{privacyPolicyContent.title}</h1>
          <p className="legal-page__notice">{privacyPolicyContent.notice}</p>
          {privacyPolicyContent.sections.map((section) => <section key={section.title}><h2>{section.title}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}
        </article>
      </main>
    </>
  );
}
