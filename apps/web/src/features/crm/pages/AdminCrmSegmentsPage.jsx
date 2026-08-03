import { useEffect, useState } from "react";

import SEO from "../../../components/seo/SEO.jsx";
import { createSavedItem, getSavedItems } from "../api/crm.service.js";

export default function AdminCrmSegmentsPage() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const load = () => getSavedItems("segments").then(setItems);
  useEffect(load, []);
  async function submit(event) { event.preventDefault(); await createSavedItem("segments", { name, mode: "DYNAMIC", criteria: {}, contactIds: [] }); setName(""); load(); }
  return <main className="admin-dashboard"><SEO title="Segments CRM" noIndex /><header><div><p className="section-eyebrow">CRM</p><h1>Segments enregistrés</h1><p>Préparez des groupes réutilisables sans dupliquer les données des contacts.</p></div></header><form className="admin-inline-form" onSubmit={submit}><label><span>Nom du segment</span><input value={name} onChange={(event) => setName(event.target.value)} required /></label><button className="btn btn-primary">Enregistrer</button></form><div className="admin-data-list">{items.map((item) => <article key={item._id}><div><span>{item.mode || "Dynamique"}</span><h2>{item.name}</h2></div></article>)}</div></main>;
}
