import SEO from "../components/seo/SEO.jsx";

import ResourcesHero from "../components/pages/resources/ResourcesHero.jsx";
import ResourcesGrid from "../components/pages/resources/ResourcesGrid.jsx";

import { seoContent } from "../content/seo.content.js";

import "../styles/pages/resources.scss";

export default function Resources() {
  return (
    <>
      <SEO {...seoContent.pages.resources} />

      <main className="page-content resources-page">
        <ResourcesHero />
        <ResourcesGrid />
      </main>
    </>
  );
}