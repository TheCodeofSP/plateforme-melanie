import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import FormErrorSummary from "../../../components/feedback/FormErrorSummary.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { routes } from "../../../config/routes.config.js";
import { verifyEmail } from "../api/auth.service.js";
import ResendVerificationEmail from "../components/ResendVerificationEmail.jsx";

import "../../../styles/pages/registration.scss";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState(token ? "loading" : "error");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(
    token ? null : { message: "Ce lien de validation est incomplet." },
  );

  useEffect(() => {
    if (!token) return;
    let active = true;
    verifyEmail(token)
      .then((data) => {
        if (active) {
          setResult(data);
          setStatus("success");
        }
      })
      .catch((apiError) => {
        if (active) {
          setError(apiError);
          setStatus("error");
        }
      });
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <>
      <SEO
        title="Validation de l’adresse email"
        description="Validation de ton compte."
        noIndex
      />
      <main className="registration-page">
        <section
          className="registration-card registration-result"
          aria-live="polite"
        >
          {status === "loading" && (
            <PageLoader label="Validation de ton adresse email…" />
          )}
          {status === "success" && (
            <>
              <span className="registration-result__icon" aria-hidden="true">
                ✓
              </span>
              <p className="section-eyebrow">Adresse confirmée</p>
              <h1>
                {result.accountActivated
                  ? "Ton espace est prêt"
                  : "Autorisation encore attendue"}
              </h1>
              <p>{result.message}</p>
              {result.accountActivated && (
                <p>
                  Bienvenue dans La Clairière. Tu peux maintenant demander ton
                  lien personnel de connexion, puis retrouver le forum, tes
                  ressources et ton parcours depuis ton espace membre.
                </p>
              )}
              {result.accountActivated ? (
                <Link className="btn btn-primary" to={routes.login}>
                  Me connecter
                </Link>
              ) : (
                <Link to={routes.home}>Revenir à l’accueil</Link>
              )}
            </>
          )}
          {status === "error" && (
            <>
              <p className="section-eyebrow">Lien non valide</p>
              <h1>Nous ne pouvons pas confirmer cette adresse</h1>
              <FormErrorSummary error={error} />
              <p>
                Si tu as déjà utilisé ce lien, ton adresse est confirmée : tu
                peux simplement te connecter. Sinon, demande un nouveau message
                de validation.
              </p>
              <Link className="btn btn-primary" to={routes.login}>
                Me connecter
              </Link>
              <ResendVerificationEmail />
            </>
          )}
        </section>
      </main>
    </>
  );
}
