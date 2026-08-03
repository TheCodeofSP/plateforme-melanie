import { useLocation } from "react-router-dom";

import ShareButton from "../../ui/ShareButton.jsx";
import ExternalMediaConsent from "../../privacy/ExternalMediaConsent.jsx";
import ResourceArticlePagination from "./ResourceArticlePagination.jsx";
import ResourceEbookCard from "./ResourceEbookCard.jsx";

import "../../../styles/components/pages/resources/resource-detail-content.scss";

export default function ResourceDetailContent({
  resource,
  previousResource,
  nextResource,
}) {
  const { pathname } = useLocation();
  const shareUrl = `${window.location.origin}${pathname}`;

  return (
    <section className="resource-detail-content">
      <div className="page-container">
        <article className="resource-detail-content__article">
          {resource.body.map((block, index) => {
            if (block.type === "heading") {
              return <h2 key={`${block.type}-${index}`}>{block.content}</h2>;
            }

            if (block.type === "paragraph") {
              return <p key={`${block.type}-${index}`}>{block.content}</p>;
            }

            if (block.type === "list") {
              return (
                <ul key={`${block.type}-${index}`}>
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              );
            }

            if (block.type === "cta" && resource.externalUrl) {
              return (
                <a
                  key={`${block.type}-${index}`}
                  href={resource.externalUrl}
                  className="btn btn-primary resource-detail-content__external-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {block.label}
                  <span aria-hidden="true"> {block.icon}</span>
                </a>
              );
            }

            return null;
          })}
          {resource.embed && (
            <div className="resource-detail-content__embed">
              <ExternalMediaConsent
                title={resource.embed.title}
                src={resource.embed.src}
                height={resource.embed.type === "spotify" ? "352" : "360"}
              />
            </div>
          )}
          <ResourceEbookCard ebook={resource.ebook} />

          {resource.externalUrl && (
            <div className="resource-detail-content__external-actions">
              <a
                href={resource.externalUrl}
                className="btn btn-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                {resource.ctaLabel}
                <span aria-hidden="true"> {resource.ctaIcon}</span>
              </a>
            </div>
          )}
          <div className="resource-detail-content__actions">
            <ShareButton
              title={resource.title}
              text={resource.description}
              url={shareUrl}
            />
          </div>
        </article>

        <ResourceArticlePagination
          previousResource={previousResource}
          nextResource={nextResource}
        />
      </div>
    </section>
  );
}
