import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

import { navigationContent } from "../../content/navigation.content.js";

import logoMelanie from "../../assets/images/logo_melanie.png";

import "../../styles/layouts/navigation.scss";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="navigation">
      <div className="page-container navigation__container">
        <Link to="/" className="navigation__brand" onClick={closeMenu}>
          <img src={logoMelanie} alt="Logo de Mélanie Dizet" />

          <div>
            <span>{navigationContent.brand}</span>
            <small>{navigationContent.slogan}</small>
          </div>
        </Link>

        <button
          type="button"
          className="navigation__toggle"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          aria-label="Ouvrir ou fermer le menu"
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          className={`navigation__menu ${
            isMenuOpen ? "navigation__menu--open" : ""
          }`}
          aria-label="Navigation principale"
        >
          <div className="navigation__links">
            {navigationContent.links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={closeMenu}
                className={({ isActive }) =>
                  isActive
                    ? "navigation__link navigation__link--active"
                    : "navigation__link"
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="navigation__actions">
            <Link
              to={navigationContent.actions.forum.to}
              className="btn btn-primary"
              onClick={closeMenu}
            >
              {navigationContent.actions.forum.label}
            </Link>

            <Link
              to={navigationContent.actions.contact.to}
              className="btn btn-secondary"
              onClick={closeMenu}
            >
              {navigationContent.actions.contact.label}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}