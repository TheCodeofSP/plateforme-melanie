import { Helmet } from "react-helmet-async";

import { seoContent } from "../../content/seo.content.js";

export default function SEO({
  title,
  description,
  image,
  url,
  robots,
}) {
  const site = seoContent.site;

  const pageTitle = title || site.title;
  const pageDescription = description || site.description;

  const pageUrl = url
    ? `${site.url}${url}`
    : site.url;

  const pageImage = image
    ? image.startsWith("http")
      ? image
      : `${site.url}${image}`
    : `${site.url}${site.image}`;

  const pageRobots = robots || site.robots;

  return (
    <Helmet>
      <title>{pageTitle}</title>

      <meta name="description" content={pageDescription} />
      <meta name="robots" content={pageRobots} />

      <link rel="canonical" href={pageUrl} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={site.name} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:image" content={pageImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />
    </Helmet>
  );
}