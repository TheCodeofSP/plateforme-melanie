import { useEffect, useState } from "react";

import { getSafePlaceImage } from "../api/safe-place-media.service.js";

export default function SafePlaceImage({ image }) {
  const [url, setUrl] = useState("");
  const id = typeof image.media === "string" ? image.media : image.media?._id;
  useEffect(() => { let active = true; getSafePlaceImage(id).then((value) => active && setUrl(value)).catch(() => {}); return () => { active = false; }; }, [id]);
  return url ? <img className="clearing-post-image" src={url} alt={image.alt} loading="lazy" /> : <div className="clearing-image-placeholder">Image en cours de chargement</div>;
}
