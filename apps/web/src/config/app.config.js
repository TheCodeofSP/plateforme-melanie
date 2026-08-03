const apiUrl = (import.meta.env.VITE_API_URL || "http://localhost:5100").replace(
  /\/$/,
  "",
);

export const appConfig = {
  apiUrl,
  apiBaseUrl: `${apiUrl}/api`,
  siteUrl: (import.meta.env.VITE_SITE_URL || "https://melaniedizet.com").replace(/\/$/, ""),
  analyticsId: import.meta.env.VITE_GA_MEASUREMENT_ID || "",
  platformName: "La Clairière",
  communityName: "Le Cercle",
  contactEmail: "thecodeofsp@gmail.com",
};
