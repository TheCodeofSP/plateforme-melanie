import { resourceFormats } from "../config/resource.config.js";

export function formatResource(resource) {
  const content = resource?.content || resource?.publishedVersion || resource?.workingVersion || {};
  return {
    ...resource,
    content,
    format: resourceFormats[content.format] || resourceFormats.ARTICLE,
    title: content.title || "Ressource sans titre",
    description: content.description || "",
    categories: content.categories || [],
    duration: content.durationMinutes ? `${content.durationMinutes} min` : null,
  };
}

export function formatDate(value) {
  if (!value) return null;
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(value));
}

export function mediaId(media) {
  return typeof media === "string" ? media : media?._id;
}

export function resourcePath(slug) {
  return `/ressources/${slug}`;
}
