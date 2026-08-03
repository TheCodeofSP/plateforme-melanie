import { useState } from "react";

export default function ExternalMediaConsent({ title, src, height = 360 }) {
  const [accepted, setAccepted] = useState(false);

  if (!accepted) {
    return (
      <div className="external-media-consent">
        <p>
          Ce contenu est hébergé par un service externe. En l’affichant, tu
          acceptes que ce service puisse déposer des cookies et recevoir des
          informations techniques.
        </p>
        <button className="btn btn-secondary" type="button" onClick={() => setAccepted(true)}>
          Afficher ce contenu
        </button>
      </div>
    );
  }

  return (
    <iframe
      title={title}
      src={src}
      width="100%"
      height={height}
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      allowFullScreen
      loading="lazy"
    />
  );
}
