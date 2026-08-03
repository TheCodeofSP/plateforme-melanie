import { useState } from "react";
import { useNavigate } from "react-router-dom";

import FormErrorSummary from "../../../components/feedback/FormErrorSummary.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { createExport, previewExport } from "../api/export-admin.service.js";

const populations = ["CONTACTS", "MEMBERS", "PROSPECTS", "QUIZ_RESULTS", "WEBINAR_REGISTRATIONS", "WEBINAR_ATTENDANCE", "COMMUNICATION_RECIPIENTS", "RESOURCES"];
const columnsByPopulation = {
  CONTACTS: ["firstName", "lastName", "primaryEmail", "status", "priority"],
  MEMBERS: ["firstName", "lastName", "email", "pseudonym", "currentSpmProfile"],
  PROSPECTS: ["firstName", "lastName", "primaryEmail", "currentSpmProfile"],
  QUIZ_RESULTS: ["email", "selectedProfile", "completedAt"],
  WEBINAR_REGISTRATIONS: ["email", "status", "registeredAt"],
  WEBINAR_ATTENDANCE: ["email", "attendanceStatus"],
  COMMUNICATION_RECIPIENTS: ["email", "deliveryStatus"],
  RESOURCES: ["title", "format", "status", "publishedAt"],
};

export default function AdminExportEditorPage() {
  const navigate = useNavigate();
  const [population, setPopulation] = useState("CONTACTS");
  const [columns, setColumns] = useState(columnsByPopulation.CONTACTS);
  const [includePrivateNotes, setIncludePrivateNotes] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const payload = { population, filters: {}, columns, includePrivateNotes, privateNotesWarningAccepted: includePrivateNotes };
  function changePopulation(value) { setPopulation(value); setColumns(columnsByPopulation[value]); setPreview(null); }
  function toggle(column) { setColumns((current) => current.includes(column) ? current.filter((item) => item !== column) : [...current, column]); }
  async function create() { try { const result = await createExport(payload); navigate(`/administration/exports/${result._id}`); } catch (apiError) { setError(apiError); } }
  return <main className="admin-dashboard"><SEO title="Nouvel export" noIndex /><header><div><p className="section-eyebrow">Exports</p><h1>Préparer un export</h1></div></header>{error && <FormErrorSummary error={error} />}<section className="admin-form"><label><span>Population</span><select value={population} onChange={(event) => changePopulation(event.target.value)}>{populations.map((item) => <option key={item}>{item}</option>)}</select></label><fieldset><legend>Colonnes</legend>{columnsByPopulation[population].map((column) => <label className="admin-check" key={column}><input type="checkbox" checked={columns.includes(column)} onChange={() => toggle(column)} /><span>{column}</span></label>)}</fieldset>{population === "CONTACTS" && <label className="admin-check"><input type="checkbox" checked={includePrivateNotes} onChange={(event) => setIncludePrivateNotes(event.target.checked)} /><span>Inclure les notes privées — j’accepte leur caractère sensible</span></label>}<div className="admin-actions"><button className="btn btn-secondary" type="button" disabled={!columns.length} onClick={() => previewExport(payload).then(setPreview).catch(setError)}>Vérifier le volume</button><button className="btn btn-primary" type="button" disabled={!columns.length} onClick={create}>Créer l’export</button></div>{preview && <p className="admin-success">Prévisualisation : {preview.count ?? preview.total ?? 0} ligne(s).</p>}</section></main>;
}
