import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import FormErrorSummary from "../../../../components/feedback/FormErrorSummary.jsx";
import SEO from "../../../../components/seo/SEO.jsx";
import { routes } from "../../../../config/routes.config.js";
import { saveEvaluation } from "../../api/webinar.service.js";

export default function WebinarEvaluationPage() {
  const { state } = useLocation(); const [form, setForm] = useState({ rating: 5, useful: true, comment: "", testimonialConsent: false }); const [saved, setSaved] = useState(false); const [error, setError] = useState(null);
  async function submit(event) { event.preventDefault(); try { await saveEvaluation(state?.sessionId, form); setSaved(true); } catch (apiError) { setError(apiError); } }
  if (saved) return <main className="webinars-page"><SEO title="Merci pour ton retour" noIndex /><div className="page-container webinar-confirmation"><h1>Merci pour ton retour</h1><p>Il aidera Mélanie à faire évoluer les prochains rendez-vous.</p><Link className="btn btn-primary" to={routes.myWebinars}>Retour à mes webinaires</Link></div></main>;
  return <main className="webinars-page"><SEO title="Évaluer le webinaire" noIndex /><div className="page-container webinar-form"><p className="section-eyebrow">Ton expérience</p><h1>Comment as-tu vécu ce rendez-vous ?</h1>{error && <FormErrorSummary error={error} />}<form onSubmit={submit}><label><span>Note sur 5</span><select value={form.rating} onChange={(event) => setForm({ ...form, rating: Number(event.target.value) })}>{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating}/5</option>)}</select></label><label className="webinar-check"><input type="checkbox" checked={form.useful} onChange={(event) => setForm({ ...form, useful: event.target.checked })} /><span>Ce webinaire m’a été utile</span></label><label><span>Commentaire facultatif</span><textarea maxLength="3000" value={form.comment} onChange={(event) => setForm({ ...form, comment: event.target.value })} /></label><label className="webinar-check"><input type="checkbox" checked={form.testimonialConsent} onChange={(event) => setForm({ ...form, testimonialConsent: event.target.checked })} /><span>J’autorise Mélanie à utiliser ce retour comme témoignage</span></label><button className="btn btn-primary">Envoyer mon retour</button></form></div></main>;
}
