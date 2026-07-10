import HomeHeader from "../components/pages/home/HomeHeader.jsx";
import HomeAccompaniments from "../components/pages/home/HomeAccompaniments.jsx";
import HomeQuiz from "../components/pages/home/HomeQuiz.jsx";
import HomeAbout from "../components/pages/home/HomeAbout.jsx";
import HomeApproach from "../components/pages/home/HomeApproach.jsx";
import HomeValues from "../components/pages/home/HomeValues.jsx";
import HomeProblems from "../components/pages/home/HomeProblems.jsx";
import HomePersonalized from "../components/pages/home/HomePersonalized.jsx";
import HomeTestimonials from "../components/pages/home/HomeTestimonials.jsx";
import HomeOffers from "../components/pages/home/HomeOffers.jsx";
import HomeVision from "../components/pages/home/HomeVision.jsx";
import HomeContactOptions from "../components/pages/home/HomeContactOptions.jsx";
import HomeCarousel from "../components/pages/home/HomeCarousel.jsx";

import SEO from "../components/seo/SEO.jsx";

import { seoContent } from "../content/seo.content.js";

import "../styles/pages/home.scss";

export default function Home() {
  return (
    <>
      <SEO {...seoContent.pages.home} />
      <main className="home">
        <HomeHeader />
        <HomeCarousel />
        <HomeAccompaniments />
        <HomeQuiz />
        <HomeAbout />
        <HomeApproach />
        <HomeValues />
        <HomeProblems />
        <HomePersonalized />
        <HomeTestimonials />
        <HomeOffers />
        <HomeVision />
        <HomeContactOptions />
      </main>
    </>
  );
}
