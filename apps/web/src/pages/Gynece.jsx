import "../styles/pages/gynece.scss";

export default function Gynece() {
  return (
    <main className="page-content gynece-page">
      <section className="gynece-auth">
        <div className="page-container gynece-auth__container">
          <div className="gynece-auth__content">
            <span className="eyebrow">Forum GYNECE</span>

            <h1>Un espace intime pour mieux comprendre ton corps.</h1>

            <p className="gynece-auth__intro">
              GYNECE est pensé comme une plateforme d’accompagnement douce,
              sécurisée et progressive. Un espace où chaque femme pourra
              retrouver ses ressources, suivre son parcours, déposer ses
              questions et avancer à son rythme.
            </p>

            <div className="gynece-auth__mission">
              <p>
                L’objectif n’est pas de remplacer l’accompagnement humain, mais
                de le prolonger : garder un lien, retrouver les bons contenus et
                se sentir guidée entre deux étapes.
              </p>
            </div>

            <ul className="gynece-auth__features">
              <li>Accéder à des ressources adaptées à son parcours.</li>
              <li>Retrouver ses résultats de quiz et ses recommandations.</li>
              <li>Découvrir des contenus autour du cycle et des émotions.</li>
              <li>Préparer ou prolonger un accompagnement avec Mélanie.</li>
            </ul>
          </div>

          <div className="gynece-auth__card" aria-label="Aperçu de connexion">
            <div className="gynece-auth__card-header">
              <p>Bienvenue sur GYNECE</p>
              <h2>Connexion</h2>
            </div>

            <form className="gynece-auth__form">
              <label>
                Email
                <input type="email" placeholder="ton@email.com" />
              </label>

              <label>
                Mot de passe
                <input type="password" placeholder="••••••••" />
              </label>

              <button type="button" className="btn btn-primary">
                Se connecter
              </button>
            </form>

            <div className="gynece-auth__links">
              <button type="button">Créer un compte</button>
              <button type="button">Mot de passe oublié ?</button>
            </div>

            <p className="gynece-auth__note">
              Cette page est une première projection visuelle. L’espace membre
              sera développé progressivement avec le back-end.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}