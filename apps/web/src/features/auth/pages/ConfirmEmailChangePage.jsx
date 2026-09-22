import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import FormErrorSummary from "../../../components/feedback/FormErrorSummary.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { routes } from "../../../config/routes.config.js";
import useAuth from "../../../hooks/useAuth.js";
import { confirmEmailChange } from "../api/auth.service.js";

import "../../../styles/pages/account.scss";

export default function ConfirmEmailChangePage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const { clearSession } = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState(
    token ? null : { message: "Ce lien de confirmation est incomplet." },
  );

  useEffect(() => {
    if (!token) return;
    let active = true;
    confirmEmailChange(token)
      .then((result) => {
        if (!active) return;
        clearSession();
        setMessage(result.message);
      })
      .catch((apiError) => active && setError(apiError));
    return () => {
      active = false;
    };
  }, [clearSession, token]);

  return (
    <main className="account-page account-page--auth">
      <SEO title="Confirmation de l’adresse email" noIndex />
      <section className="account-card">
        <p className="section-eyebrow">Adresse email</p>
        <h1>Confirmation du changement</h1>
        {!message && !error && <PageLoader label="Vérification du lien…" />}
        {error && (
          <>
            <FormErrorSummary error={error} />
            <p>
              Si tu as déjà confirmé ce changement, reconnecte-toi avec ta nouvelle adresse email.
            </p>
            <Link className="btn btn-primary" to={routes.login}>
              Me reconnecter
            </Link>
          </>
        )}
        {message && (
          <div className="account-feedback" role="status">
            <p>{message}</p>
            <p>Toutes les sessions précédentes ont été fermées pour protéger ton compte.</p>
            <Link className="btn btn-primary" to={routes.login}>
              Me reconnecter
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
