import { FiCalendar, FiInstagram, FiMail, FiMapPin } from "react-icons/fi";

import { appConfig } from "../../../config/app.config.js";
import { contactContent } from "../../../content/contact.content.js";

const methodConfig = {
  email: {
    Icon: FiMail,
    href: () => `mailto:${appConfig.contactEmail}`,
    detail: () => appConfig.contactEmail,
  },
  instagram: {
    Icon: FiInstagram,
    href: () => appConfig.instagramUrl,
    detail: () => (appConfig.instagramUrl ? "Voir le profil Instagram" : ""),
  },
  location: {
    Icon: FiMapPin,
    href: () => "",
    detail: () => appConfig.contactLocation,
  },
  booking: {
    Icon: FiCalendar,
    href: () => appConfig.bookingUrl,
    detail: () => (appConfig.bookingUrl ? "Ouvrir l’agenda" : ""),
  },
};

export default function ContactInfos() {
  return (
    <section
      className="contact-methods"
      aria-labelledby="contact-methods-title"
    >
      <h2 id="contact-methods-title">{contactContent.methods.title}</h2>
      <div className="contact-methods__grid">
        {contactContent.methods.items.map((item) => {
          const { Icon, href, detail } = methodConfig[item.type];
          const methodHref = href();
          const methodDetail = detail();
          const content = (
            <>
              <Icon aria-hidden="true" />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              {methodDetail ? (
                <strong>{methodDetail}</strong>
              ) : (
                <small>Information à compléter</small>
              )}
            </>
          );

          return methodHref ? (
            <a
              key={item.type}
              href={methodHref}
              target={item.type === "email" ? undefined : "_blank"}
              rel={item.type === "email" ? undefined : "noreferrer"}
            >
              {content}
            </a>
          ) : (
            <article key={item.type}>{content}</article>
          );
        })}
      </div>
    </section>
  );
}
