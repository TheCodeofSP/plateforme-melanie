import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ErrorState from "../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import {
  anonymizeAccount,
  getAccount,
  setAccountStatus,
} from "../api/account-admin.service.js";

export default function AdminAccountDetailPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState("");
  const [actionError, setActionError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const load = () => getAccount(userId).then(setData).catch(setError);
  useEffect(load, [userId]);
  if (!data && !error) return <PageLoader />;
  if (error)
    return (
      <ErrorState
        title="Ce compte est indisponible"
        description={error.message}
      />
    );
  const { user } = data;

  async function action(name) {
    setActionError(null);
    setIsSubmitting(true);
    try {
      await setAccountStatus(userId, name, comment || null);
      setComment("");
      await load();
    } catch (apiError) {
      setActionError(apiError);
    } finally {
      setIsSubmitting(false);
    }
  }
  async function anonymize() {
    if (
      !window.confirm(
        "Anonymiser définitivement ce compte et ses données personnelles ?",
      )
    )
      return;
    setActionError(null);
    setIsSubmitting(true);
    try {
      await anonymizeAccount(userId);
      navigate("/administration/comptes");
    } catch (apiError) {
      setActionError(apiError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="admin-dashboard">
      <SEO title="Fiche compte" noIndex />
      <header>
        <div>
          <p className="section-eyebrow">
            {user.role} · {user.accountStatus}
          </p>
          <h1>
            {user.pseudonym || `${user.firstName || ""} ${user.lastName || ""}`}
          </h1>
          <p>{user.email}</p>
        </div>
      </header>
      <div className="admin-detail-grid">
        <section>
          <h2>Repères</h2>
          <dl>
            <div>
              <dt>Email vérifié</dt>
              <dd>{user.emailVerifiedAt ? "Oui" : "Non"}</dd>
            </div>
            <div>
              <dt>Quiz SPM</dt>
              <dd>{user.currentSpmProfile || "Non défini"}</dd>
            </div>
            <div>
              <dt>Création</dt>
              <dd>{new Date(user.createdAt).toLocaleDateString("fr-FR")}</dd>
            </div>
          </dl>
        </section>
        <section>
          <h2>Gestion du compte</h2>
          {actionError && (
            <ErrorState
              title="L’action n’a pas pu être réalisée"
              description={actionError.message}
            />
          )}
          <label>
            <span>Motif interne facultatif</span>
            <textarea
              rows="3"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
          </label>
          <div className="admin-actions">
            {user.accountStatus === "ACTIVE" && (
              <button
                className="btn btn-secondary"
                disabled={isSubmitting}
                onClick={() => action("suspend")}
              >
                Suspendre
              </button>
            )}
            {user.accountStatus === "SUSPENDED" && (
              <button
                className="btn btn-secondary"
                disabled={isSubmitting}
                onClick={() => action("reactivate")}
              >
                Réactiver
              </button>
            )}
            {user.role === "INTERVENANT" &&
              user.accountStatus !== "ANONYMIZED" && (
                <button
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                  onClick={() => action("revoke-intervenant")}
                >
                  Retirer le rôle
                </button>
              )}
            {user.accountStatus !== "ANONYMIZED" && (
              <button
                className="btn btn-danger"
                disabled={isSubmitting}
                onClick={anonymize}
              >
                Anonymiser
              </button>
            )}
          </div>
        </section>
      </div>
      <section className="admin-panel">
        <h2>Historique administratif</h2>
        {data.adminActions?.length ? (
          <ul>
            {data.adminActions.map((item) => (
              <li key={item._id}>
                {item.action} ·{" "}
                {new Date(item.createdAt).toLocaleString("fr-FR")}
              </li>
            ))}
          </ul>
        ) : (
          <p>Aucune action enregistrée.</p>
        )}
      </section>
    </main>
  );
}
