import { useContext } from "react";

import { CookieConsentContext } from "../contexts/cookie-consent-context.js";

export default function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) throw new Error("useCookieConsent doit être utilisé dans CookieConsentProvider.");
  return context;
}
