import { useState } from "react";
import { Link } from "react-router-dom";

import { routes } from "../../config/routes.config.js";
import useCookieConsent from "../../hooks/useCookieConsent.js";

import "../../styles/components/privacy/cookie-consent.scss";

export default function CookieConsent() {
  const { consent, isPanelOpen, acceptAll, refuseOptional, savePreferences, closePanel } = useCookieConsent();
  const [analytics, setAnalytics] = useState(consent?.analytics ?? false);
  if (consent && !isPanelOpen) return null;

  return (
    <section className="cookie-consent" role="dialog" aria-modal="true" aria-labelledby="cookie-title">
      <div className="cookie-consent__content">
        <p className="eyebrow">Tes choix, simplement</p>
        <h2 id="cookie-title">Respecter ta pause, c’est aussi respecter tes données.</h2>
        <p>Les cookies essentiels permettent à La Clairière de fonctionner. Avec ton accord, une mesure d’audience anonyme nous aide à améliorer les parcours.</p>
        {isPanelOpen && <div className="cookie-consent__preferences"><label><span><strong>Cookies essentiels</strong><small>Toujours actifs pour la connexion et la sécurité.</small></span><input type="checkbox" checked disabled /></label><label><span><strong>Mesure d’audience</strong><small>Google Analytics, chargé uniquement après ton accord.</small></span><input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} /></label></div>}
        <div className="cookie-consent__actions">
          <button className="btn btn-primary" type="button" onClick={acceptAll}>Tout accepter</button>
          <button className="btn btn-secondary" type="button" onClick={refuseOptional}>Tout refuser</button>
          {isPanelOpen ? <button className="btn btn-soft" type="button" onClick={() => savePreferences({ analytics })}>Enregistrer mes choix</button> : null}
          {isPanelOpen && consent ? <button type="button" className="cookie-consent__close" onClick={closePanel}>Fermer</button> : null}
        </div>
        <Link to={routes.cookiesPolicy}>Comprendre notre utilisation des cookies</Link>
      </div>
    </section>
  );
}
