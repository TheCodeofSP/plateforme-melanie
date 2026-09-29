import { useEffect, useState } from "react";

import { getMediaAccess } from "../api/resource.service.js";
import { mediaId } from "../utils/resource-display.utils.js";

export default function ResourceCover({ media, url: directUrl = "", alt = "", format }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    const id = mediaId(media);
    if (!id || directUrl) return;
    let active = true;
    getMediaAccess(id)
      .then((result) => active && setUrl(result.url))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [media, directUrl]);

  if (directUrl || url)
    return (
      <img
        className="resource-cover"
        src={directUrl || url}
        alt={alt}
        loading="lazy"
        decoding="async"
      />
    );
  return (
    <div className="resource-cover resource-cover--fallback" aria-hidden="true">
      <span>{format?.icon || "✦"}</span>
    </div>
  );
}
