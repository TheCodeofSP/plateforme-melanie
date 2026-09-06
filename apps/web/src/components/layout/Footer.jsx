import { Link } from "react-router-dom";
import { FiInstagram, FiMail, FiMessageCircle } from "react-icons/fi";

import { appConfig } from "../../config/app.config.js";
import { routes } from "../../config/routes.config.js";
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
          </div>
        </div>

        <div className="footer__contacts" aria-label="Contacter Mélanie">
          <a
            href={`mailto:${appConfig.contactEmail}`}
            aria-label="Envoyer un e-mail à Mélanie"
            title="E-mail"
          >
            <FiMail aria-hidden="true" />
          </a>
          {appConfig.instagramUrl && (
            <a
              href={appConfig.instagramUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Voir le profil Instagram de Mélanie"
              title="Instagram"
            >
              <FiInstagram aria-hidden="true" />
            </a>
          )}
          <Link
            to={routes.contact}
            aria-label="Ouvrir la page Contact"
            title="Contact"
          >
            <FiMessageCircle aria-hidden="true" />
          </Link>
        </div>

        <div className="footer__bottom">
          <p>{footerContent.copyright}</p>

          <div className="footer__legal">
            {footerContent.legal.map((link) => (
              <Link key={link.to} to={link.to}>
                {link.label}
              </Link>
            ))}
            <button type="button" onClick={openPanel}>
              Gérer mes cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
