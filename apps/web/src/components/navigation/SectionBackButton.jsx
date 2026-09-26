import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const SCROLL_OFFSET = 120;
const MIN_SCROLL_DISTANCE = 240;

export default function SectionBackButton() {
  const { pathname } = useLocation();
  const sectionsRef = useRef([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function collectSections() {
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
      const sections = sectionsRef.current;
      if (sections.length === 0) {
        setIsVisible(false);
        return;
      }

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
  }, [pathname]);

  function scrollToPreviousSection() {
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
      onClick={scrollToPreviousSection}
      aria-label="Remonter à la section précédente"
    >
      <span aria-hidden="true">↑</span>
      <span>Section précédente</span>
    </button>
  );
}
