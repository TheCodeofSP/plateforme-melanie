import { Link } from "react-router-dom";

import { routes } from "../config/routes.config.js";
import { platformContent } from "../content/platform.content.js";

import "../styles/pages/gynece.scss";

export default function Gynece() {
  const community = platformContent.communitySpace;

  return (
    <main className="page-content gynece-page">
      <section className="gynece-auth">
        <div className="page-container gynece-auth__container">
          <div className="gynece-auth__content">
            <span className="eyebrow">Espace d’échange confidentiel</span>
            <h1>{community.name}</h1>

            <p className="gynece-auth__intro">{community.description}</p>

            <div className="gynece-auth__mission">
              <p>
                L’objectif n’est pas de remplacer l’accompagnement humain, mais
                de le prolonger : garder un lien, trouver les bons espaces et
                ne plus avancer seule.
              </p>
            </div>

            <ul className="gynece-auth__features">
              <li>Partager avec un pseudonyme, dans un cadre confidentiel.</li>
              <li>Échanger avec des femmes qui vivent des situations proches.</li>
              <li>Retrouver des discussions organisées par thématique.</li>
              <li>Avancer à son rythme, dans le respect de la charte.</li>
            </ul>
          </div>

          <div className="gynece-auth__card" aria-label="Accès à la plateforme">
            <div className="gynece-auth__card-header">
              <p>Bienvenue dans {community.name}</p>
              <h2>Un espace réservé aux membres</h2>
            </div>

            <Link to={routes.login} className="btn btn-primary">
              Se connecter
            </Link>

            <div className="gynece-auth__links">
              <Link to={routes.contact}>Une question sur la plateforme ?</Link>
            </div>

            <p className="gynece-auth__note">
              La création de compte et l’accès aux discussions seront ajoutés
              au fil des prochains blocs.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
