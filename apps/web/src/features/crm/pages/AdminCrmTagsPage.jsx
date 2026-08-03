import { useEffect, useState } from "react";

import SEO from "../../../components/seo/SEO.jsx";
import { archiveTag, createTag, getTags } from "../api/crm.service.js";

export default function AdminCrmTagsPage() {
  const [tags, setTags] = useState([]);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#6f8f72");
  const load = () => getTags().then(setTags);
  useEffect(load, []);
  async function submit(event) { event.preventDefault(); await createTag({ name, color }); setName(""); load(); }
  async function archive(id) { await archiveTag(id); load(); }
  return <main className="admin-dashboard"><SEO title="Étiquettes CRM" noIndex /><header><div><p className="section-eyebrow">CRM</p><h1>Étiquettes</h1></div></header><form className="admin-inline-form" onSubmit={submit}><label><span>Nom</span><input value={name} onChange={(event) => setName(event.target.value)} required /></label><label><span>Couleur</span><input type="color" value={color} onChange={(event) => setColor(event.target.value)} /></label><button className="btn btn-primary">Créer</button></form><div className="admin-data-list">{tags.map((tag) => <article key={tag._id}><div><span className="admin-color" style={{ "--tag-color": tag.color }} /><h2>{tag.name}</h2></div>{!tag.archivedAt && <button className="btn btn-secondary" onClick={() => archive(tag._id)}>Archiver</button>}</article>)}</div></main>;
}
