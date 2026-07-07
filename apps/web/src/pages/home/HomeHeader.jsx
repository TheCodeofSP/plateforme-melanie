import logoMelanie from "../../assets/images/logo_melanie.webp";

export default function HomeHeader() {
  return (
    <header className="home-header">
      <div className="page-container">
        <span className="home-header__eyebrow">Développement en cours</span>
        <img
          src={logoMelanie}
          alt="Logo de la plateforme de Mélanie"
          className="home-header__logo"
        />
        <h1 className="home-header__title">
          La plateforme de Mélanie est en cours de création.
        </h1>

        <p className="home-header__text">
          Elle est actuellement assemblée avec amour, quelques litres de café et
          beaucoup de lignes de code.{" "}
        </p>

        <p className="home-header__signature">
          Développée avec ❤️ par <strong>The Code of SP</strong>
        </p>
      </div>
    </header>
  );
}
