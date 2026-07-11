import SEO from "../components/seo/SEO.jsx";

import AccompanimentsHero from "../components/pages/accompaniments/AccompanimentsHero.jsx";
import AccompanimentsIntro from "../components/pages/accompaniments/AccompanimentsIntro.jsx";
import AccompanimentsServices from "../components/pages/accompaniments/AccompanimentsServices.jsx";
import AccompanimentsChoice from "../components/pages/accompaniments/AccompanimentsChoice.jsx";
import AccompanimentsProcess from "../components/pages/accompaniments/AccompanimentsProcess.jsx";
import AccompanimentsNote from "../components/pages/accompaniments/AccompanimentsNote.jsx";
import AccompanimentsCta from "../components/pages/accompaniments/AccompanimentsCta.jsx";

import { seoContent } from "../content/seo.content.js";

import "../styles/pages/accompaniments.scss";

export default function Accompaniments() {
  return (
    <>
      <SEO {...seoContent.pages.accompaniments} />

      <main className="page-content accompaniments-page">
        <AccompanimentsHero />
        <AccompanimentsIntro />
        <AccompanimentsServices />
        <AccompanimentsChoice />
        <AccompanimentsProcess />
        <AccompanimentsNote />
        <AccompanimentsCta />
      </main>
    </>
  );
}