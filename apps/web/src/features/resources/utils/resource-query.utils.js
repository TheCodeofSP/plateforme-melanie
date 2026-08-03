export function parseResourceQuery(searchParams) {
  return {
    q: searchParams.get("recherche") || "",
    formats: searchParams.get("formats")?.split(",").filter(Boolean) || [],
    categories: searchParams.get("categories")?.split(",").filter(Boolean) || [],
    sort: searchParams.get("tri") || "newest",
  };
}

export function toApiResourceParams(filters, page = 1) {
  return {
    ...(filters.q.trim().length >= 2 && { q: filters.q.trim() }),
    ...(filters.formats.length && { format: filters.formats.join(",") }),
    ...(filters.categories.length && { category: filters.categories.join(",") }),
    sort: filters.sort,
    page,
    limit: 12,
  };
}

export function writeResourceQuery(filters) {
  const params = new URLSearchParams();
  if (filters.q) params.set("recherche", filters.q);
  if (filters.formats.length) params.set("formats", filters.formats.join(","));
  if (filters.categories.length) params.set("categories", filters.categories.join(","));
  if (filters.sort !== "newest") params.set("tri", filters.sort);
  return params;
}
