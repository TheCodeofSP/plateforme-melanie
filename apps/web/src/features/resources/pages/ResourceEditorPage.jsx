import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import FormErrorSummary from "../../../components/feedback/FormErrorSummary.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import useAuth from "../../../hooks/useAuth.js";
import { getResourceMeta } from "../api/resource.service.js";
import { createResource, getMyResources, publishResource, submitResource, updateResource } from "../api/resource-management.service.js";
import { uploadResourceMedia } from "../api/resource-media.service.js";
import ResourceBlocks from "../components/ResourceBlocks.jsx";
import { emptyResourceVersion, publicResourceFormats } from "../config/resource.config.js";

import "../../../styles/pages/resources/resource-editor.scss";

export default function ResourceEditorPage() {
  const { resourceId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "ADMIN";
  const [resource, setResource] = useState(null);
  const [version, setVersion] = useState(emptyResourceVersion);
  const [meta, setMeta] = useState({ categories: [], spmProfiles: [] });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const base = isAdmin ? "/administration/ressources" : "/espace-intervenante/ressources";

  useEffect(() => { getResourceMeta().then(setMeta).catch(setError); }, []);
  useEffect(() => {
    if (!resourceId) return;
    getMyResources(isAdmin).then((items) => {
      const found = items.find((item) => item._id === resourceId);
      if (!found) throw new Error("Cette ressource n’est pas disponible.");
      setResource(found);
      setVersion({ ...emptyResourceVersion, ...(found.workingVersion?.title ? found.workingVersion : found.publishedVersion || {}) });
    }).catch(setError);
  }, [isAdmin, resourceId]);

  const complete = useMemo(() => version.title.trim() && version.description.trim() && version.categories.length && version.durationMinutes && (!["ARTICLE", "NEWSLETTER"].includes(version.format) || version.blocks.some((block) => block.text?.trim() || block.items?.length)) && (!["EBOOK", "TOOL"].includes(version.format) || version.pdf) && (!["VIDEO", "PODCAST"].includes(version.format) || version.media || version.externalUrl) && (version.format !== "PODCAST" || version.showName), [version]);
  function field(name, value) { setVersion((current) => ({ ...current, [name]: value })); }
  function toggle(name, value, max) { field(name, version[name].includes(value) ? version[name].filter((item) => item !== value) : max && version[name].length >= max ? version[name] : [...version[name], value]); }

  async function save() {
    setBusy(true); setError(null);
    try {
      if (resource) { const updated = await updateResource(resource._id, version); setResource(updated); }
      else { const created = await createResource(version); setResource(created); navigate(`${base}/${created._id}/modifier`, { replace: true }); }
    } catch (apiError) { setError(apiError); } finally { setBusy(false); }
  }

  async function finalAction() {
    setBusy(true); setError(null);
    try {
      let current = resource;
      if (!current) current = await createResource(version);
      current = await updateResource(current._id, version);
      if (isAdmin) await publishResource(current._id, { visibility: version.proposedVisibility });
      else await submitResource(current._id);
      navigate(base);
    } catch (apiError) { setError(apiError); } finally { setBusy(false); }
  }

  async function upload(event, purpose, fieldName) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try { const media = await uploadResourceMedia(file, purpose, resource?._id); field(fieldName, media._id); } catch (apiError) { setError(apiError); } finally { setBusy(false); }
  }

  return <main className="resource-editor"><SEO title={resource ? "Modifier une ressource" : "Créer une ressource"} noIndex /><header><p className="section-eyebrow">{isAdmin ? "Administration" : "Espace intervenante"}</p><h1>{resource ? "Faire évoluer la ressource" : "Créer une ressource"}</h1></header>{error && <FormErrorSummary error={error} />}<form onSubmit={(event) => event.preventDefault()}>
    <Field label="Titre"><input value={version.title} maxLength="180" onChange={(event) => field("title", event.target.value)} /></Field>
    <Field label="Description courte"><textarea value={version.description} maxLength="1000" onChange={(event) => field("description", event.target.value)} /></Field>
    <Field label="Format"><select value={version.format} onChange={(event) => { const format = event.target.value; setVersion((current) => ({ ...current, format, sourceMode: ["VIDEO", "PODCAST"].includes(format) ? "EXTERNAL" : "TEXT" })); }}>{publicResourceFormats.map((format) => <option key={format.value} value={format.value}>{format.label}</option>)}</select></Field>
    <Field label="Durée en minutes"><input type="number" min="1" max="10000" value={version.durationMinutes} onChange={(event) => field("durationMinutes", Number(event.target.value))} /></Field>
    <fieldset><legend>Catégories</legend><div className="editor-options">{meta.categories.map((category) => <label key={category.value}><input type="checkbox" checked={version.categories.includes(category.value)} onChange={() => toggle("categories", category.value)} /> {category.label}</label>)}</div></fieldset>
    <fieldset><legend>Profils SPM recommandés ({version.recommendedSpmProfiles.length}/2)</legend><div className="editor-options">{meta.spmProfiles.map((profile) => <label key={profile}><input type="checkbox" checked={version.recommendedSpmProfiles.includes(profile)} onChange={() => toggle("recommendedSpmProfiles", profile, 2)} /> {profile.replaceAll("_", " ")}</label>)}</div></fieldset>
    <Field label="Visibilité"><select value={version.proposedVisibility} onChange={(event) => field("proposedVisibility", event.target.value)}><option value="PUBLIC">Tout public</option><option value="MEMBERS_ONLY">Réservée aux membres</option></select></Field>
    <Field label="Image de couverture"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => upload(event, "COVER", "coverMedia")} />{version.coverMedia && <small>Image transférée</small>}</Field>
    {version.coverMedia && <Field label="Texte alternatif de la couverture"><input value={version.coverAlt || ""} maxLength="300" onChange={(event) => field("coverAlt", event.target.value)} /></Field>}
    {["ARTICLE", "NEWSLETTER"].includes(version.format) && <BlockEditor blocks={version.blocks} onChange={(blocks) => field("blocks", blocks)} />}
    {["VIDEO", "PODCAST"].includes(version.format) && <><Field label="Mode de diffusion"><select value={version.sourceMode} onChange={(event) => field("sourceMode", event.target.value)}><option value="EXTERNAL">Lien externe</option><option value="HOSTED">Fichier hébergé</option></select></Field>{version.sourceMode === "EXTERNAL" ? <Field label="Lien externe"><input type="url" value={version.externalUrl || ""} onChange={(event) => field("externalUrl", event.target.value)} /></Field> : <Field label="Fichier média"><input type="file" accept={version.format === "VIDEO" ? "video/mp4,video/webm,video/quicktime" : "audio/mpeg,audio/mp4,audio/x-m4a,audio/wav"} onChange={(event) => upload(event, version.format === "VIDEO" ? "VIDEO" : "AUDIO", "media")} /></Field>}</>}
    {version.format === "PODCAST" && <Field label="Nom de l’émission"><input value={version.showName || ""} onChange={(event) => field("showName", event.target.value)} /></Field>}
    {["EBOOK", "TOOL"].includes(version.format) && <Field label="Fichier PDF"><input type="file" accept="application/pdf" onChange={(event) => upload(event, "PDF", "pdf")} />{version.pdf && <small>PDF transféré</small>}</Field>}
    <div className="resource-editor__actions"><button type="button" className="btn btn-secondary" onClick={() => setPreview((value) => !value)}>{preview ? "Fermer l’aperçu" : "Prévisualiser"}</button><button type="button" className="btn btn-secondary" disabled={busy} onClick={save}>Enregistrer le brouillon</button><button type="button" className="btn btn-primary" disabled={busy || !complete} onClick={finalAction}>{isAdmin ? "Publier la ressource" : "Soumettre à Mélanie"}</button></div>
    {preview && <section className="resource-editor__preview"><p className="section-eyebrow">Aperçu non publié</p><h2>{version.title || "Titre de la ressource"}</h2><p>{version.description}</p><ResourceBlocks blocks={version.blocks} /></section>}
  </form></main>;
}

function Field({ label, children }) { return <label className="editor-field"><span>{label}</span>{children}</label>; }

function BlockEditor({ blocks, onChange }) {
  function change(index, value) { onChange(blocks.map((block, itemIndex) => itemIndex === index ? (["BULLET_LIST", "NUMBERED_LIST"].includes(block.type) ? { ...block, items: value.split("\n").filter(Boolean) } : { ...block, text: value }) : block)); }
  return <fieldset><legend>Contenu éditorial</legend><div className="editor-blocks">{blocks.map((block, index) => { const isList = ["BULLET_LIST", "NUMBERED_LIST"].includes(block.type); return <div key={`${block.type}-${index}`}><select value={block.type} onChange={(event) => { const type = event.target.value; onChange(blocks.map((item, itemIndex) => itemIndex === index ? (["BULLET_LIST", "NUMBERED_LIST"].includes(type) ? { type, items: [] } : { type, text: "" }) : item)); }}><option value="PARAGRAPH">Paragraphe</option><option value="HEADING">Intertitre</option><option value="QUOTE">Citation</option><option value="BULLET_LIST">Liste à puces</option><option value="NUMBERED_LIST">Liste numérotée</option></select><textarea value={isList ? (block.items || []).join("\n") : block.text || ""} onChange={(event) => change(index, event.target.value)} placeholder={isList ? "Une ligne par élément" : ""} /><button type="button" onClick={() => onChange(blocks.filter((_, itemIndex) => itemIndex !== index))}>Supprimer</button></div>; })}</div><button type="button" className="btn btn-secondary" onClick={() => onChange([...blocks, { type: "PARAGRAPH", text: "" }])}>Ajouter un bloc</button></fieldset>;
}
