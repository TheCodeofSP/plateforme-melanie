import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import FormErrorSummary from "../../../../components/feedback/FormErrorSummary.jsx";
import PageLoader from "../../../../components/feedback/PageLoader.jsx";
import SEO from "../../../../components/seo/SEO.jsx";
import { createAdminWebinar, getAdminWebinar, updateAdminWebinar } from "../../api/webinar-admin.service.js";
import { spmProfileLabels } from "../../config/webinar.config.js";

const initial = { title: "", shortDescription: "", description: "", recommendedProfiles: [] };
export default function AdminWebinarEditorPage() {
  const { webinarId } = useParams(); const navigate = useNavigate(); const [form, setForm] = useState(initial); const [loading, setLoading] = useState(Boolean(webinarId)); const [error, setError] = useState(null);
  useEffect(() => { if (!webinarId) return; getAdminWebinar(webinarId).then(({ webinar }) => setForm({ title: webinar.title, shortDescription: webinar.shortDescription, description: webinar.description, recommendedProfiles: webinar.recommendedProfiles || [] })).catch(setError).finally(() => setLoading(false)); }, [webinarId]);
  if (loading) return <PageLoader />;
  function toggleProfile(profile) { setForm((current) => ({ ...current, recommendedProfiles: current.recommendedProfiles.includes(profile) ? current.recommendedProfiles.filter((item) => item !== profile) : current.recommendedProfiles.length < 2 ? [...current.recommendedProfiles, profile] : current.recommendedProfiles })); }
  async function submit(event) { event.preventDefault(); try { const webinar = webinarId ? await updateAdminWebinar(webinarId, form) : await createAdminWebinar(form); navigate(`/administration/webinaires/${webinar._id || webinarId}`); } catch (apiError) { setError(apiError); } }
  return <main className="webinar-admin"><SEO title={webinarId ? "Modifier le webinaire" : "Nouveau webinaire"} noIndex /><header><p className="section-eyebrow">Préparer le rendez-vous</p><h1>{webinarId ? "Modifier le webinaire" : "Créer un webinaire"}</h1></header>{error && <FormErrorSummary error={error} />}<form className="webinar-admin-form" onSubmit={submit}><label><span>Titre</span><input minLength="3" maxLength="180" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required /></label><label><span>Présentation courte</span><textarea minLength="10" maxLength="350" value={form.shortDescription} onChange={(event) => setForm({ ...form, shortDescription: event.target.value })} required /></label><label><span>Description complète</span><textarea minLength="20" maxLength="12000" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required /></label><fieldset><legend>Profils SPM recommandés — 2 maximum</legend>{Object.entries(spmProfileLabels).map(([profile, label]) => <label className="webinar-check" key={profile}><input type="checkbox" checked={form.recommendedProfiles.includes(profile)} disabled={!form.recommendedProfiles.includes(profile) && form.recommendedProfiles.length >= 2} onChange={() => toggleProfile(profile)} /><span>{label}</span></label>)}</fieldset><p className="webinar-disclaimer">L’image est facultative et sera ajoutée lorsque l’API permettra son envoi depuis le front.</p><button className="btn btn-primary">Enregistrer</button></form></main>;
}
