import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import FormErrorSummary from "../../../../components/feedback/FormErrorSummary.jsx";
import SEO from "../../../../components/seo/SEO.jsx";
import { routes } from "../../../../config/routes.config.js";
import { confirmRegistration } from "../../api/webinar.service.js";

export default function WebinarConfirmationPage() {
  const { registrationId } = useParams(); const [confirmed, setConfirmed] = useState(false); const [error, setError] = useState(null); const [busy, setBusy] = useState(false);
  async function confirm() { setBusy(true); try { await confirmRegistration(registrationId); setConfirmed(true); } catch (apiError) { setError(apiError); } finally { setBusy(false); } }
  return <main className="webinars-page"><SEO title="Confirmer ma place" noIndex /><div className="page-container webinar-confirmation"><p className="section-eyebrow">Une place s’est libérée</p><h1>Confirmer ma place</h1>{confirmed ? <><p role="status">Ta place est confirmée. Tu retrouveras toutes les informations dans ton espace.</p><Link className="btn btn-primary" to={routes.myWebinars}>Voir mes webinaires</Link></> : <><p>Cette proposition est temporaire. Confirme-la maintenant pour réserver définitivement ta place.</p>{error && <FormErrorSummary error={error} />}<button className="btn btn-primary" type="button" disabled={busy} onClick={confirm}>{busy ? "Confirmation…" : "Confirmer ma place"}</button></>}</div></main>;
}
