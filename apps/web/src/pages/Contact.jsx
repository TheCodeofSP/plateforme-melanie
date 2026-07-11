import ContactHeader from "../components/pages/contact/ContactHeader.jsx";
import ContactForm from "../components/pages/contact/ContactForm.jsx";

import SEO from "../components/seo/SEO.jsx";

import { seoContent } from "../content/seo.content.js";

import "../styles/pages/contact.scss";

export default function Contact() {
  return (
    <>
      <SEO {...seoContent.pages.contact} />
      <section className="page-content contact-page">
        <div className="page-container">
          <ContactHeader />

          <ContactForm />
        </div>
      </section>
    </>
  );
}
