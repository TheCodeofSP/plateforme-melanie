import { useEffect, useMemo, useState } from "react";

import { appConfig } from "../config/app.config.js";
import { CookieConsentContext } from "./cookie-consent-context.js";

const storageKey = "la-clairiere-cookie-consent";

function readConsent() {
  try {
    return JSON.parse(window.localStorage.getItem(storageKey)) || null;
  } catch {
    return null;
  }
}

export function CookieConsentProvider({ children }) {
  const [consent, setConsent] = useState(readConsent);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    if (!consent?.analytics || !appConfig.analyticsId) return;
    if (document.querySelector("[data-google-analytics]")) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", appConfig.analyticsId, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });

    const script = document.createElement("script");
    script.async = true;
    script.dataset.googleAnalytics = "true";
    script.src = `https://www.googletagmanager.com/gtag/js?id=${appConfig.analyticsId}`;
    document.head.append(script);
  }, [consent]);

  function save(nextConsent) {
    const value = { essential: true, analytics: nextConsent.analytics, updatedAt: new Date().toISOString() };
    window.localStorage.setItem(storageKey, JSON.stringify(value));
    setConsent(value);
    setIsPanelOpen(false);
  }

  const value = useMemo(() => ({
    consent,
    isPanelOpen,
    acceptAll: () => save({ analytics: true }),
    refuseOptional: () => save({ analytics: false }),
    savePreferences: save,
    openPanel: () => setIsPanelOpen(true),
    closePanel: () => setIsPanelOpen(false),
  }), [consent, isPanelOpen]);

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>;
}
