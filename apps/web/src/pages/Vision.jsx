import SEO from "../components/seo/SEO.jsx";

import VisionHero from "../components/pages/vision/VisionHero.jsx";
import VisionMelanie from "../components/pages/vision/VisionMelanie.jsx";
import VisionStory from "../components/pages/vision/VisionStory.jsx";
import VisionConvictions from "../components/pages/vision/VisionConvictions.jsx";
import VisionApproach from "../components/pages/vision/VisionApproach.jsx";
import VisionValues from "../components/pages/vision/VisionValues.jsx";
import VisionTraining from "../components/pages/vision/VisionTraining.jsx";
import VisionCta from "../components/pages/vision/VisionCta.jsx";

import { seoContent } from "../content/seo.content.js";

import "../styles/pages/vision.scss";

export default function Vision() {
  return (
    <>
      <SEO {...seoContent.pages.vision} />

      <main className="vision-page">
        <VisionHero />
        <VisionMelanie />
        <VisionStory />
        <VisionConvictions />
        <VisionApproach />
        <VisionValues />
        <VisionTraining />
        <VisionCta />
      </main>
    </>
  );
}