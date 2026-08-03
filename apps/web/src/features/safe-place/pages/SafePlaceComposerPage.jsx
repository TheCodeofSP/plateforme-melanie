import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import FormErrorSummary from "../../../components/feedback/FormErrorSummary.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { safePlaceContent } from "../../../content/safe-place.content.js";
import useAuth from "../../../hooks/useAuth.js";
import { createPost, getCategories, getPost, submitPostCorrection, updatePost } from "../api/safe-place.service.js";
import { uploadSafePlaceImage } from "../api/safe-place-media.service.js";
import SafePlaceShell from "../components/SafePlaceShell.jsx";
import { emptyDiscussion } from "../config/safe-place.config.js";

export default function SafePlaceComposerPage() {
  const { postId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [categories, setCategories] = useState(null);
  const [form, setForm] = useState({ ...emptyDiscussion, categoryId: location.state?.categoryId || "" });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { getCategories().then(setCategories).catch(setError); }, []);
  useEffect(() => { if (postId) getPost(postId).then((post) => setForm({ categoryId: post.category?._id || post.category, title: post.title, content: post.content, links: post.links || [], images: post.images || [], allowComments: post.allowComments, allowReactions: post.allowReactions, notifyMembers: false })).catch(setError); }, [postId]);
  useEffect(() => {
    if (!form.title && !form.content) return;
    const guard = (event) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [form.content, form.title]);
  if (!categories) return <PageLoader />;
  function field(name, value) { setForm((current) => ({ ...current, [name]: value })); }
  async function upload(event) {
    const files = [...event.target.files].slice(0, 3 - form.images.length);
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const invalidFile = files.find((file) => !allowedTypes.includes(file.type) || file.size > 5 * 1024 * 1024);
    if (invalidFile) {
      setError(new Error("Chaque image doit être au format JPEG, PNG ou WebP et peser 5 Mo maximum."));
      event.target.value = "";
      return;
    }
    setBusy(true);
    try {
      const added = [];
      for (const file of files) { const media = await uploadSafePlaceImage(file); added.push({ media: media._id, alt: "" }); }
      field("images", [...form.images, ...added]);
    } catch (apiError) { setError(apiError); } finally { setBusy(false); }
  }
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError(null);
    try {
      let post;
      const payload = { ...form, links: form.links.filter((link) => link.label && link.url) };
      const editableFields = { title: payload.title, content: payload.content, links: payload.links, images: payload.images };
      if (postId) post = location.state?.correction ? await submitPostCorrection(postId, editableFields) : await updatePost(postId, editableFields);
      else post = await createPost(payload);
      navigate(`/espace-communaute/discussions/${post._id || postId}`);
    } catch (apiError) { setError(apiError); } finally { setBusy(false); }
  }
  return <SafePlaceShell compact><SEO title={postId ? "Modifier la discussion" : "Ouvrir une discussion"} noIndex /><p className="section-eyebrow">Déposer une parole</p><h1>{postId ? "Faire évoluer ta discussion" : "Ouvrir une discussion"}</h1><p className="clearing-privacy">{safePlaceContent.composer.privacy}</p>{error && <FormErrorSummary error={error} />}<form className="clearing-composer" onSubmit={submit}><label><span>Catégorie</span><select value={form.categoryId} onChange={(event) => field("categoryId", event.target.value)} required disabled={Boolean(postId)}><option value="">Choisir un chemin</option>{categories.filter((category) => category.allowNewPosts && (isAdmin || !category.adminOnly)).map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select></label><label><span>Titre</span><input value={form.title} minLength="5" maxLength="180" onChange={(event) => field("title", event.target.value)} required /><small>{form.title.length}/180</small></label><label><span>Ce que tu souhaites déposer</span><textarea value={form.content} minLength="10" maxLength="10000" onChange={(event) => field("content", event.target.value)} required /><small>{form.content.length}/10000 · {safePlaceContent.composer.mention}</small></label><fieldset><legend>Liens facultatifs ({form.links.length}/3)</legend>{form.links.map((link, index) => <div key={index}><input aria-label="Libellé du lien" value={link.label} onChange={(event) => field("links", form.links.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item))} /><input aria-label="URL du lien" type="url" value={link.url} onChange={(event) => field("links", form.links.map((item, itemIndex) => itemIndex === index ? { ...item, url: event.target.value } : item))} /></div>)}{form.links.length < 3 && <button type="button" onClick={() => field("links", [...form.links, { label: "", url: "" }])}>Ajouter un lien</button>}</fieldset><fieldset><legend>Images facultatives ({form.images.length}/3)</legend>{form.images.map((image, index) => <label key={image.media}><span>Texte alternatif de l’image {index + 1}</span><input value={image.alt} minLength="2" maxLength="300" onChange={(event) => field("images", form.images.map((item, itemIndex) => itemIndex === index ? { ...item, alt: event.target.value } : item))} required /></label>)}{form.images.length < 3 && <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={upload} />}</fieldset>{isAdmin && <fieldset><legend>Réglages de l’annonce</legend><label className="clearing-check"><input type="checkbox" checked={form.allowComments} onChange={(event) => field("allowComments", event.target.checked)} /><span>Autoriser les commentaires</span></label><label className="clearing-check"><input type="checkbox" checked={form.allowReactions} onChange={(event) => field("allowReactions", event.target.checked)} /><span>Autoriser les réactions</span></label>{!postId && <label className="clearing-check"><input type="checkbox" checked={form.notifyMembers} onChange={(event) => field("notifyMembers", event.target.checked)} /><span>Prévenir les membres</span></label>}</fieldset>}<button className="btn btn-primary" disabled={busy}>{busy ? "Envoi…" : postId ? "Enregistrer les modifications" : "Ouvrir la discussion"}</button></form></SafePlaceShell>;
}
