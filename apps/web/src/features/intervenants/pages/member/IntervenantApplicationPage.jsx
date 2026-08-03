import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import FormErrorSummary from "../../../../components/feedback/FormErrorSummary.jsx";
import PageLoader from "../../../../components/feedback/PageLoader.jsx";
import SEO from "../../../../components/seo/SEO.jsx";
import { routes } from "../../../../config/routes.config.js";
import { intervenantsContent } from "../../../../content/intervenants.content.js";
import { deleteApplicationDocument, uploadApplicationDocument } from "../../api/application-document.service.js";
import { createApplication, getMyApplications, submitApplication, updateApplication } from "../../api/intervenant-application.service.js";
import ApplicationProgress from "../../components/ApplicationProgress.jsx";

const initial = { professionalName: "", profession: "", specialties: [], presentation: "", motivations: "", links: { website: "", instagram: "", linkedin: "" } };
export default function IntervenantApplicationPage() {
  const navigate = useNavigate(); const [application, setApplication] = useState(null); const [form, setForm] = useState(initial); const [step, setStep] = useState(0); const [specialty, setSpecialty] = useState(""); const [error, setError] = useState(null); const [busy, setBusy] = useState(false); const [saved, setSaved] = useState(false);
  useEffect(() => {
    getMyApplications().then(async (items) => {
      const draft = items.find((item) => item.status === "DRAFT") || await createApplication();
      setApplication(draft); setForm({ professionalName: draft.professionalName || "", profession: draft.profession || "", specialties: draft.specialties || [], presentation: draft.presentation || "", motivations: draft.motivations || "", links: { website: draft.links?.website || "", instagram: draft.links?.instagram || "", linkedin: draft.links?.linkedin || "" } });
    }).catch(setError);
  }, []);
  if (!application && !error) return <PageLoader />;
  function field(name, value) { setSaved(false); setForm((current) => ({ ...current, [name]: value })); }
  async function save(next = null) { setBusy(true); setError(null); try { const updated = await updateApplication(application._id, form); setApplication((current) => ({ ...current, ...updated })); setSaved(true); if (next !== null) setStep(next); } catch (apiError) { setError(apiError); } finally { setBusy(false); } }
  async function upload(event) {
    const file = event.target.files[0]; if (!file) return;
    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type) || file.size > 10 * 1024 * 1024) { setError(new Error("Le justificatif doit être un PDF, JPEG ou PNG de 10 Mo maximum.")); return; }
    setBusy(true); try { if (application.documents?.[0]) await deleteApplicationDocument(application.documents[0]._id); const document = await uploadApplicationDocument(application._id, file); setApplication((current) => ({ ...current, documents: [document] })); } catch (apiError) { setError(apiError); } finally { setBusy(false); }
  }
  async function submit() {
    if (!application.documents?.length && !window.confirm("Aucun justificatif n’est joint. Souhaites-tu tout de même transmettre ta demande ?")) return;
    setBusy(true); setError(null);
    try {
      await updateApplication(application._id, form);
      await submitApplication(application._id);
      navigate(routes.memberIntervenantApplicationStatus);
    } catch (apiError) { setError(apiError); } finally { setBusy(false); }
  }
  return <main className="intervenant-application"><SEO title="Ma demande pour devenir intervenante" noIndex /><div className="page-container application-layout"><ApplicationProgress current={step} /><section className="application-panel"><p className="section-eyebrow">Un dossier à construire à ton rythme</p><h1>Devenir intervenante</h1>{saved && <p className="application-saved" role="status">Brouillon enregistré.</p>}{error && <FormErrorSummary error={error} />}{step === 0 && <><h2>Ton activité professionnelle</h2><label><span>Nom professionnel</span><input maxLength="120" value={form.professionalName} onChange={(event) => field("professionalName", event.target.value)} /></label><label><span>Profession</span><input maxLength="120" value={form.profession} onChange={(event) => field("profession", event.target.value)} /></label><fieldset><legend>Spécialités — 10 maximum</legend><div className="application-specialty"><input value={specialty} onChange={(event) => setSpecialty(event.target.value)} /><button type="button" onClick={() => { if (specialty.trim().length >= 2 && form.specialties.length < 10) { field("specialties", [...form.specialties, specialty.trim()]); setSpecialty(""); } }}>Ajouter</button></div><ul>{form.specialties.map((item) => <li key={item}>{item}<button type="button" onClick={() => field("specialties", form.specialties.filter((value) => value !== item))}>Retirer</button></li>)}</ul></fieldset></>}{step === 1 && <><h2>Présente ton activité</h2><label><span>Présentation professionnelle</span><textarea minLength="50" maxLength="2000" value={form.presentation} onChange={(event) => field("presentation", event.target.value)} /><small>{form.presentation.length}/2000</small></label></>}{step === 2 && <><h2>Pourquoi souhaites-tu contribuer ?</h2><label><span>Motivations</span><textarea minLength="50" maxLength="2000" value={form.motivations} onChange={(event) => field("motivations", event.target.value)} /><small>{form.motivations.length}/2000</small></label></>}{step === 3 && <><h2>Tes liens professionnels</h2>{Object.entries({ website: "Site internet", instagram: "Instagram", linkedin: "LinkedIn" }).map(([name, label]) => <label key={name}><span>{label}</span><input type="url" value={form.links[name]} onChange={(event) => field("links", { ...form.links, [name]: event.target.value })} /></label>)}</>}{step === 4 && <><h2>Ton justificatif</h2><p>{intervenantsContent.documents}</p>{application.documents?.[0] ? <article className="application-document"><div><strong>{application.documents[0].originalName}</strong><span>{Math.round(application.documents[0].size / 1024)} Ko</span></div><button type="button" onClick={async () => { await deleteApplicationDocument(application.documents[0]._id); setApplication((current) => ({ ...current, documents: [] })); }}>Supprimer</button></article> : <label className="application-upload"><span>Ajouter un justificatif</span><input type="file" accept="application/pdf,image/jpeg,image/png" onChange={upload} /></label>}</>}{step === 5 && <><h2>Vérifie ta demande</h2><dl><div><dt>Nom professionnel</dt><dd>{form.professionalName}</dd></div><div><dt>Profession</dt><dd>{form.profession}</dd></div><div><dt>Spécialités</dt><dd>{form.specialties.join(", ")}</dd></div><div><dt>Présentation</dt><dd>{form.presentation}</dd></div><div><dt>Motivations</dt><dd>{form.motivations}</dd></div><div><dt>Justificatif</dt><dd>{application.documents?.[0]?.originalName || "Aucun document"}</dd></div></dl><p>Ta demande sera examinée par Mélanie. Ton profil ne sera pas publié automatiquement.</p></>}<div className="application-actions">{step > 0 && <button className="btn btn-secondary" type="button" onClick={() => setStep(step - 1)}>Précédent</button>}{step < 5 ? <button className="btn btn-primary" type="button" disabled={busy} onClick={() => save(step + 1)}>Enregistrer et continuer</button> : <button className="btn btn-primary" type="button" disabled={busy} onClick={submit}>Transmettre ma demande à Mélanie</button>}</div></section></div></main>;
}
