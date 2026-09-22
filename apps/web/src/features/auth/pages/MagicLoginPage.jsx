import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import FormErrorSummary from "../../../components/feedback/FormErrorSummary.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { roleHome, routes } from "../../../config/routes.config.js";
import useAuth from "../../../hooks/useAuth.js";
import { loginWithLink } from "../api/auth.service.js";
import "../../../styles/pages/registration.scss";

export default function MagicLoginPage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const { refreshUser } = useAuth();
  const [state, setState] = useState({
    status: token ? "loading" : "error",
    user: null,
    error: token ? null : { message: "Ce lien de connexion est incomplet." },
  });

  useEffect(() => {
    if (!token) return;
    loginWithLink(token)
      .then(async (user) => {
        await refreshUser();
        setState({ status: "success", user, error: null });
      })
      .catch((error) => setState({ status: "error", user: null, error }));
  }, [refreshUser, token]);

  return (
    <main className="registration-page">
      <SEO title="Connexion à La Clairière" noIndex />
      <section className="registration-card registration-result" aria-live="polite">
        {state.status === "loading" && <PageLoader label="Ouverture de ton espace…" />}
        {state.status === "success" && (
          <>
            <span className="registration-result__icon" aria-hidden="true">
              ✓
            </span>
            <p className="section-eyebrow">Connexion réussie</p>
            <h1>Bienvenue dans ton espace</h1>
            <p>
              Ton accès est ouvert sur cet appareil. Tu peux reprendre ton chemin, découvrir les
              contenus réservés aux membres et rejoindre les espaces qui t’accompagnent.
            </p>
            <p className="registration-notice">
              Pour ta sécurité, ce lien vient d’être utilisé et ne pourra plus servir.
            </p>
            <Link className="btn btn-primary" to={roleHome(state.user.role)}>
              Entrer dans mon espace
            </Link>
          </>
        )}
        {state.status === "error" && (
          <>
            <p className="section-eyebrow">Lien non valide</p>
            <h1>Demande un nouveau lien</h1>
            <FormErrorSummary error={state.error} />
            <Link className="btn btn-primary" to={routes.login}>
              Recevoir un nouveau lien
            </Link>
          </>
        )}
      </section>
    </main>
  );
}
