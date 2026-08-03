import { Link } from "react-router-dom";

import { footerContent } from "../../content/footer.content.js";
import useCookieConsent from "../../hooks/useCookieConsent.js";

import logoMelanie from "../../assets/images/logo-clairiere.png";

import "../../styles/layouts/footer.scss";

export default function Footer() {
  const { openPanel } = useCookieConsent();
  return (
    <footer className="footer">
      <div className="page-container footer__container">
        <div className="footer__brand">
          <img src={logoMelanie} alt="Logo officiel de La Clairière" />

          <div>
            <p className="footer__mission">{footerContent.mission}</p>
            <p className="footer__description">{footerContent.description}</p>
          </div>
        </div>

        <div className="footer__columns">
          <nav className="footer__column" aria-label="Navigation footer">
            <h2>{footerContent.navigation.title}</h2>

            {footerContent.navigation.links.map((link) => (
              <Link key={link.to} to={link.to}>
                {link.label}
              </Link>
            ))}
          </nav>

          <nav className="footer__column" aria-label="Liens plateforme">
            <h2>{footerContent.platform.title}</h2>

            {footerContent.platform.links.map((link) => (
              <Link key={link.to} to={link.to}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="footer__column">
            <h2>{footerContent.contact.title}</h2>

            <a href={`mailto:${footerContent.contact.email}`}>
              {footerContent.contact.email}
            </a>

            <p>{footerContent.contact.location}</p>
          </div>
        </div>

        <div className="footer__bottom">
          <p>{footerContent.copyright}</p>

          <div className="footer__legal">
            {footerContent.legal.map((link) => (
              <Link key={link.to} to={link.to}>
                {link.label}
              </Link>
            ))}
            <button type="button" onClick={openPanel}>Gérer mes cookies</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
