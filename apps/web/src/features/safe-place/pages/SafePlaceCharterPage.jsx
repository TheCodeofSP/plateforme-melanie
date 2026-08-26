import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import FormErrorSummary from "../../../components/feedback/FormErrorSummary.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { routes } from "../../../config/routes.config.js";
import useAuth from "../../../hooks/useAuth.js";
import { acceptCharter, getCharter } from "../api/safe-place.service.js";
import SafePlaceShell from "../components/SafePlaceShell.jsx";

export default function SafePlaceCharterPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [charter, setCharter] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    getCharter().then(setCharter).catch(setError);
  }, []);
  if (!charter && !error) return <PageLoader />;
  async function accept() {
    try {
      await acceptCharter();
      navigate(routes.community);
    } catch (apiError) {
      setError(apiError);
    }
  }
  return (
    <SafePlaceShell compact>
      <SEO title="Charte du forum de La Clairière" noIndex />
      <p className="section-eyebrow">Notre cadre commun</p>
      <h1>{charter?.title || "La charte du forum de La Clairière"}</h1>
      {error && <FormErrorSummary error={error} />}
      <div className="clearing-charter">
        {charter?.introduction && <p>{charter.introduction}</p>}
        {charter?.invitation && <p>{charter.invitation}</p>}
        {charter?.rules?.length > 0 ? (
          <ol>
            {charter.rules.map((rule) => (
              <li key={rule.title}>
                <h2>{rule.title}</h2>
                <p>{rule.text}</p>
              </li>
            ))}
          </ol>
        ) : (
          charter?.principles?.length > 0 && (
            <ul>
              {charter.principles.map((principle) => (
                <li key={principle}>{principle}</li>
              ))}
            </ul>
          )
        )}
        {charter?.closing && <strong>{charter.closing}</strong>}
        {charter?.welcome && <strong>{charter.welcome}</strong>}
      </div>
      {isAuthenticated && user?.role === "MEMBER" && (
        <>
          <label className="clearing-charter__accept">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
            />
            <span>J’ai lu la charte et je m’engage à la respecter.</span>
          </label>
          <button
            className="btn btn-primary"
            disabled={!accepted}
            onClick={accept}
          >
            Accepter et entrer dans le forum
          </button>
        </>
      )}
    </SafePlaceShell>
  );
}
