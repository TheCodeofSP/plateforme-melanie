import { useEffect, useState } from "react";

import FormErrorSummary from "../../../components/feedback/FormErrorSummary.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "../api/notification.service.js";

const labels = {
  ACCOUNT_SECURITY: "Compte et sécurité",
  RESOURCES: "Ressources",
  SAFE_PLACE: "Le forum",
  WEBINARS: "Webinaires",
  COMMUNICATIONS: "Communications",
  PERSONAL_ADMINISTRATION: "Informations administratives personnelles",
};

export default function NotificationPreferencesPage() {
  const [categories, setCategories] = useState(null);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    getNotificationPreferences()
      .then((result) => setCategories(result.categories))
      .catch(setError);
  }, []);
  if (!categories && !error) return <PageLoader />;
  function change(category, channel, value) {
    setCategories((current) => ({
      ...current,
      [category]: { ...current[category], [channel]: value },
    }));
    setSaved(false);
  }
  async function submit(event) {
    event.preventDefault();
    try {
      const result = await updateNotificationPreferences(categories);
      setCategories(result.categories);
      setSaved(true);
    } catch (apiError) {
      setError(apiError);
    }
  }
  return (
    <main className="notifications-page">
      <SEO title="Préférences de notifications" noIndex />
      <div className="page-container notification-preferences">
        <header>
          <p className="section-eyebrow">Choisir ce qui compte</p>
          <h1>Mes préférences de notifications</h1>
          <p>
            Tu peux choisir comment recevoir les informations de chaque espace.
            Les messages indispensables à la sécurité ou à la gestion de ton
            compte restent envoyés.
          </p>
        </header>
        {error && <FormErrorSummary error={error} />}
        {saved && (
          <p role="status" className="webinar-success">
            Tes préférences sont enregistrées.
          </p>
        )}
        <form onSubmit={submit}>
          <div className="notification-preferences__head">
            <span>Catégorie</span>
            <span>Plateforme</span>
            <span>Email</span>
          </div>
          {Object.entries(categories || {}).map(([category, channels]) => (
            <fieldset key={category}>
              <legend>{labels[category] || category}</legend>
              <label>
                <input
                  type="checkbox"
                  checked={channels.platform}
                  onChange={(event) =>
                    change(category, "platform", event.target.checked)
                  }
                />
                <span>Plateforme</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={channels.email}
                  onChange={(event) =>
                    change(category, "email", event.target.checked)
                  }
                />
                <span>Email</span>
              </label>
            </fieldset>
          ))}
          <button className="btn btn-primary">
            Enregistrer mes préférences
          </button>
        </form>
      </div>
    </main>
  );
}
