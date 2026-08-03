import SEO from "../components/seo/SEO.jsx";
import { legalPagesContent } from "../content/legal/legal-pages.content.js";

import "../styles/pages/legal-premium.scss";

export default function LegalEditorialPage({ page }) {
  const content = legalPagesContent[page];
  return <main id="main-content" className="legal-editorial"><SEO title={content.title} description={content.introduction} /><header><div className="page-container"><p className="eyebrow">{content.eyebrow}</p><h1>{content.title}</h1><p>{content.introduction}</p></div></header><div className="page-container legal-editorial__content">{content.sections.map((section) => <section key={section.title}><h2>{section.title}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}</div></main>;
}
