import { useEffect, useState } from "react";

import FormErrorSummary from "../../../components/feedback/FormErrorSummary.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { createAdminCategory, getAdminCategories, setCategoryStatus, updateAdminCategory } from "../api/safe-place-admin.service.js";

import "../../../styles/pages/safe-place/safe-place-admin.scss";

const initial = { name: "", description: "", displayOrder: 0, allowNewPosts: true, adminOnly: false, allowComments: true, allowReactions: true };
export default function AdminSafePlaceCategoriesPage() {
  const [categories, setCategories] = useState(null); const [form, setForm] = useState(initial); const [editing, setEditing] = useState(null); const [error, setError] = useState(null);
  async function load() { setCategories(await getAdminCategories()); }
  useEffect(() => { getAdminCategories().then(setCategories).catch(setError); }, []);
  if (!categories) return <PageLoader />;
  async function submit(event) { event.preventDefault(); try { if (editing) await updateAdminCategory(editing, form); else await createAdminCategory(form); setForm(initial); setEditing(null); await load(); } catch (apiError) { setError(apiError); } }
  return <main className="clearing-admin"><SEO title="Catégories de La Clairière" noIndex /><header><p className="section-eyebrow">Organisation</p><h1>Catégories</h1></header>{error && <FormErrorSummary error={error} />}<form className="clearing-admin-form" onSubmit={submit}><label><span>Nom</span><input value={form.name} minLength="2" maxLength="120" onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label><label><span>Description</span><textarea value={form.description} minLength="5" maxLength="500" onChange={(event) => setForm({ ...form, description: event.target.value })} required /></label><label><span>Ordre</span><input type="number" min="0" value={form.displayOrder} onChange={(event) => setForm({ ...form, displayOrder: Number(event.target.value) })} /></label>{["allowNewPosts", "allowComments", "allowReactions", "adminOnly"].map((name) => <label className="clearing-check" key={name}><input type="checkbox" checked={form[name]} onChange={(event) => setForm({ ...form, [name]: event.target.checked })} /><span>{({ allowNewPosts: "Autoriser les discussions", allowComments: "Autoriser les commentaires", allowReactions: "Autoriser les réactions", adminOnly: "Réserver à Mélanie" })[name]}</span></label>)}<button className="btn btn-primary">{editing ? "Enregistrer" : "Créer la catégorie"}</button></form><section className="clearing-admin-list">{categories.map((category) => <article key={category._id}><span>{category.status}</span><h2>{category.name}</h2><p>{category.description}</p><div><button onClick={() => { setEditing(category._id); setForm({ name: category.name, description: category.description, displayOrder: category.displayOrder, allowNewPosts: category.allowNewPosts, adminOnly: category.adminOnly, allowComments: category.allowComments, allowReactions: category.allowReactions }); }}>Modifier</button>{category.status === "ACTIVE" ? <><button onClick={async () => { await setCategoryStatus(category._id, "hide"); await load(); }}>Masquer</button><button onClick={async () => { await setCategoryStatus(category._id, "archive"); await load(); }}>Archiver</button></> : <button onClick={async () => { await setCategoryStatus(category._id, "restore"); await load(); }}>Restaurer</button>}</div></article>)}</section></main>;
}
