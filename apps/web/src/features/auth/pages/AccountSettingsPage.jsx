import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../../../components/feedback/ConfirmDialog.jsx";
import FormErrorSummary from "../../../components/feedback/FormErrorSummary.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { routes } from "../../../config/routes.config.js";
import useAuth from "../../../hooks/useAuth.js";
import { deleteAccount, requestEmailChange, updateProfile } from "../api/auth.service.js";
import "../../../styles/pages/account.scss";

function Feedback({ message }) {
  return message ? (
    <p className="account-feedback" role="status">
      {message}
    </p>
  ) : null;
}

export default function AccountSettingsPage() {
  const navigate = useNavigate();
  const { clearSession, refreshUser, user } = useAuth();
  const [pseudonym, setPseudonym] = useState(user.pseudonym || "");
  const [newEmail, setNewEmail] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [feedback, setFeedback] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [isDeletionDialogOpen, setIsDeletionDialogOpen] = useState(false);

  async function run(section, action) {
    setError(null);
    setBusy(true);
    try {
      const result = await action();
      setFeedback((current) => ({ ...current, [section]: result.message }));
      return result;
    } catch (apiError) {
      setError(apiError);
      return null;
    } finally {
      setBusy(false);
    }
  }
  async function saveProfile(event) {
    event.preventDefault();
    if (await run("profile", () => updateProfile({ pseudonym }))) await refreshUser();
  }
  async function saveEmail(event) {
    event.preventDefault();
    if (await run("email", () => requestEmailChange({ newEmail }))) setNewEmail("");
  }
  function requestAccountDeletion(event) {
    event.preventDefault();
    if (confirmation === "SUPPRIMER") setIsDeletionDialogOpen(true);
  }
  async function confirmAccountDeletion() {
    setIsDeletionDialogOpen(false);
    if (await run("deletion", () => deleteAccount({ confirmation }))) {
      clearSession();
      navigate(routes.home, { replace: true });
    }
  }

  return (
    <main className="account-page">
      <SEO title="Mon compte" noIndex />
      <header className="account-page__header">
        <p className="section-eyebrow">Espace personnel</p>
        <h1>Mon compte</h1>
        <p>
          La connexion fonctionne par lien email, sans mot de passe. Tu peux modifier ton pseudonyme
          et ton adresse.
        </p>
      </header>
      {error && <FormErrorSummary error={error} />}
      <div className="account-grid">
        <section className="account-card">
          <h2>Mes informations</h2>
          <dl className="account-identity">
            <div>
              <dt>Prénom</dt>
              <dd>{user.firstName}</dd>
            </div>
            <div>
              <dt>Nom</dt>
              <dd>{user.lastName}</dd>
            </div>
          </dl>
          <p>Ton prénom et ton nom restent privés et ne sont pas modifiables depuis cet espace.</p>
          <form className="account-form" onSubmit={saveProfile}>
            <label className="form-field">
              <span>Pseudonyme public</span>
              <input
                value={pseudonym}
                onChange={(event) => setPseudonym(event.target.value)}
                required
              />
            </label>
            <button className="btn btn-primary" disabled={busy}>
              Enregistrer
            </button>
          </form>
          <Feedback message={feedback.profile} />
        </section>
        <section className="account-card">
          <h2>Adresse email</h2>
          <p>
            Adresse actuelle : <strong>{user.email}</strong>
          </p>
          <form className="account-form" onSubmit={saveEmail}>
            <label className="form-field">
              <span>Nouvelle adresse</span>
              <input
                type="email"
                value={newEmail}
                onChange={(event) => setNewEmail(event.target.value)}
                required
              />
            </label>
            <button className="btn btn-primary" disabled={busy}>
              Envoyer le lien de confirmation
            </button>
          </form>
          <Feedback message={feedback.email} />
        </section>
        <section className="account-card account-card--danger account-card--wide">
          <h2>Supprimer mon compte</h2>
          <p>
            Cette action est définitive. Tu seras immédiatement déconnectée, tes accès et tes liens
            de connexion seront désactivés. Les publications conservées dans le forum seront
            anonymisées et les résultats du Quiz SPM resteront enregistrés sans lien avec ton
            identité.
          </p>
          <form className="account-form account-form--inline" onSubmit={requestAccountDeletion}>
            <label className="form-field">
              <span>Écris SUPPRIMER pour confirmer</span>
              <input
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                required
              />
            </label>
            <button className="btn btn-danger" disabled={busy || confirmation !== "SUPPRIMER"}>
              Supprimer définitivement
            </button>
          </form>
        </section>
      </div>
      <ConfirmDialog
        isOpen={isDeletionDialogOpen}
        title="Supprimer définitivement ton compte ?"
        description="Tu vas être déconnectée et tu ne pourras plus utiliser tes anciens liens de connexion. Cette action ne pourra pas être annulée."
        confirmLabel="Oui, supprimer mon compte"
        confirmClassName="btn btn-danger"
        cancelLabel="Conserver mon compte"
        onConfirm={confirmAccountDeletion}
        onCancel={() => setIsDeletionDialogOpen(false)}
      />
    </main>
  );
}
