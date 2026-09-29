import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const SCROLL_OFFSET = 120;
const MIN_SCROLL_DISTANCE = 240;

export default function SectionBackButton() {
  const { pathname } = useLocation();
  const isHomePage = pathname === "/";
  const sectionsRef = useRef([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function collectSections() {
      if (!isHomePage) {
        sectionsRef.current = [];
        return;
      }

      const main = document.getElementById("main-content") || document.querySelector("main");
      if (!main) {
        sectionsRef.current = [];
        return;
      }

      const directSections = Array.from(
        main.querySelectorAll(":scope > section, :scope > article"),
      ).filter((section) => section.getBoundingClientRect().height > 0);

      sectionsRef.current = directSections.length > 0 ? directSections : [main];
    }

    function updateCurrentSection() {
      if (!isHomePage) {
        setIsVisible(window.scrollY > MIN_SCROLL_DISTANCE);
        return;
      }

      const sections = sectionsRef.current;
      if (sections.length === 0) return setIsVisible(false);

      const referenceLine = window.scrollY + SCROLL_OFFSET;
      let activeIndex = 0;

      sections.forEach((section, index) => {
        const sectionTop = section.getBoundingClientRect().top + window.scrollY;
        if (sectionTop <= referenceLine) {
          activeIndex = index;
        }
      });

      setCurrentSectionIndex(activeIndex);
      setIsVisible(activeIndex > 0 || window.scrollY > MIN_SCROLL_DISTANCE);
    }

    function handleResize() {
      collectSections();
      updateCurrentSection();
    }

    const animationFrame = window.requestAnimationFrame(() => {
      collectSections();
      updateCurrentSection();
    });
    window.addEventListener("scroll", updateCurrentSection, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", updateCurrentSection);
      window.removeEventListener("resize", handleResize);
    };
  }, [isHomePage, pathname]);

  function handleClick() {
    if (!isHomePage) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const sections = sectionsRef.current;
    const targetIndex = currentSectionIndex > 0 ? currentSectionIndex - 1 : 0;
    sections[targetIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  if (!isVisible) return null;

  return (
    <button
      className="section-back-button"
      type="button"
      onClick={handleClick}
      aria-label={isHomePage ? "Remonter à la section précédente" : "Revenir en haut de la page"}
      title={isHomePage ? "Section précédente" : "Haut de page"}
    >
      <span aria-hidden="true">↑</span>
    </button>
  );
}
