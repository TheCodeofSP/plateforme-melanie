import { BrowserRouter, Route, Routes } from "react-router-dom";

import ScrollToTop from "../layouts/ScrollToTop.jsx";

import PublicLayout from "../layouts/PublicLayout.jsx";
import Home from "../pages/Home.jsx";
import Contact from "../pages/Contact.jsx";
import Resources from "../pages/Ressources.jsx";
import ResourceDetail from "../pages/ResourceDetail.jsx";
import Quiz from "../pages/Quiz.jsx";
import Accompaniments from "../pages/Accompaniments.jsx";
import Vision from "../pages/Vision.jsx";
import Gynece from "../pages/Gynece.jsx";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/resources/:resourceId" element={<ResourceDetail />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/accompagnements" element={<Accompaniments />} />
          <Route path="/vision" element={<Vision />} />
          <Route path="/gynece" element={<Gynece />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
