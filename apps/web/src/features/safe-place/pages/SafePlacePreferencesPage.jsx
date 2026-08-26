import { useEffect, useState } from "react";

import FormErrorSummary from "../../../components/feedback/FormErrorSummary.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { routes } from "../../../config/routes.config.js";
import {
  getNotificationPreferences,
  updateSafePlacePreference,
  withdrawCharter,
} from "../api/safe-place.service.js";
import SafePlaceShell from "../components/SafePlaceShell.jsx";

export default function SafePlacePreferencesPage() {
  const [enabled, setEnabled] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    getNotificationPreferences()
      .then((preferences) =>
        setEnabled(preferences.categories?.SAFE_PLACE?.platform ?? true),
      )
      .catch(setError);
  }, []);
  if (enabled === null && !error) return <PageLoader />;
  return (
    <SafePlaceShell compact>
      <SEO title="Préférences du forum" noIndex />
      <p className="section-eyebrow">Tranquillité</p>
      <h1>Mes préférences</h1>
      {error && <FormErrorSummary error={error} />}
      <label className="clearing-preference">
        <input
          type="checkbox"
          checked={Boolean(enabled)}
          onChange={async (event) => {
            const value = event.target.checked;
            setEnabled(value);
            try {
              await updateSafePlacePreference({ platform: value });
            } catch (apiError) {
              setEnabled(!value);
              setError(apiError);
            }
          }}
        />
        <span>Recevoir dans la plateforme les nouvelles du forum</span>
      </label>
      <button
        className="btn btn-secondary"
        onClick={async () => {
          if (
            window.confirm(
              "Retirer ton acceptation de la charte et quitter le forum ?",
            )
          ) {
            await withdrawCharter();
            window.location.assign(routes.community);
          }
        }}
      >
        Quitter le forum
      </button>
    </SafePlaceShell>
  );
}
