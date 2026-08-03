import { useState } from "react";

import { getMediaAccess } from "../api/resource.service.js";
import { mediaId } from "../utils/resource-display.utils.js";

export default function ResourcePlayer({ resource }) {
  const [mediaUrl, setMediaUrl] = useState("");
  const [error, setError] = useState("");
  const content = resource.content;
  const hostedId = mediaId(content.media);

  async function openHosted(download = false) {
    try {
      const result = await getMediaAccess(download ? mediaId(content.pdf) : hostedId, download);
      if (download) window.open(result.url, "_blank", "noopener,noreferrer");
      else setMediaUrl(result.url);
    } catch {
      setError("Le média n’est pas disponible pour le moment.");
    }
  }

  if (["EBOOK", "TOOL"].includes(content.format)) {
    return <section className="resource-player"><h2>{content.format === "EBOOK" ? "Consulter le livret" : "Télécharger l’outil"}</h2><button className="btn btn-primary" onClick={() => openHosted(true)}>Télécharger le PDF</button>{error && <p role="alert">{error}</p>}</section>;
  }

  if (!["VIDEO", "PODCAST", "AUDIO"].includes(content.format)) return null;
  if (content.externalUrl) {
    return <section className="resource-player"><h2>Écouter ou regarder</h2><a className="btn btn-primary" href={content.externalUrl} target="_blank" rel="noreferrer">Ouvrir sur {content.externalPlatform || "la plateforme d’origine"}</a></section>;
  }
  if (!hostedId) return null;
  return <section className="resource-player"><h2>Écouter ou regarder</h2>{!mediaUrl && <button className="btn btn-primary" onClick={() => openHosted(false)}>Charger le lecteur</button>}{mediaUrl && (content.format === "VIDEO" ? <video controls src={mediaUrl} /> : <audio controls src={mediaUrl} />)}{error && <p role="alert">{error}</p>}</section>;
}
