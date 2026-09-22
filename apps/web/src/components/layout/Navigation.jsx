import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";

import { navigationContent } from "../../content/navigation.content.js";
import { roleHome, routes } from "../../config/routes.config.js";
import useAuth from "../../hooks/useAuth.js";
import NotificationBell from "../../features/notifications/components/NotificationBell.jsx";

import logoMelanie from "../../assets/images/logo-clairiere.png";

import "../../styles/layouts/navigation.scss";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const discoveryRef = useRef(null);
  const navigationRef = useRef(null);
  const { pathname } = useLocation();
  const { isAuthenticated, logout, user } = useAuth();

  function closeMenu() {
    setIsMenuOpen(false);
    setIsDiscoveryOpen(false);
    setIsAccountOpen(false);
  }

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        setIsDiscoveryOpen(false);
        setIsAccountOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        isMenuOpen &&
        navigationRef.current &&
        !navigationRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
        setIsDiscoveryOpen(false);
        setIsAccountOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleOutsideClick);
    return () =>
      document.removeEventListener("pointerdown", handleOutsideClick);
  }, [isMenuOpen]);

  const isDiscoveryActive = navigationContent.discoveryLinks.some(
    ({ to }) => pathname === to || pathname.startsWith(`${to}/`),
  );

  const accountLabel =
    user?.role === "ADMIN"
      ? "Administration"
      : user?.role === "INTERVENANT"
        ? user?.professionalName || "Espace intervenante"
        : user?.pseudonym || "Mon espace";

  async function handleLogout() {
    await logout();
    closeMenu();
  }

  return (
    <header className="navigation" ref={navigationRef}>
      <div className="page-container navigation__container">
        <Link to="/" className="navigation__brand" onClick={closeMenu}>
          <img src={logoMelanie} alt="" />

          <span>{navigationContent.brand}</span>
        </Link>

        <div className="navigation__mobile-actions">
          <button
            type="button"
            className={`navigation__toggle ${isMenuOpen ? "navigation__toggle--open" : ""}`}
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-controls="main-navigation-menu"
            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <nav
          id="main-navigation-menu"
          className={`navigation__menu ${
            isMenuOpen ? "navigation__menu--open" : ""
          }`}
          aria-label="Navigation principale"
        >
          <div className="navigation__links">
            {navigationContent.primaryLinks.map((link) => (
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

            <div
              className="navigation__discovery"
              ref={discoveryRef}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setIsDiscoveryOpen(false);
                }
              }}
            >
              <button
                type="button"
                className={`navigation__link navigation__discovery-toggle ${
                  isDiscoveryActive ? "navigation__link--active" : ""
                }`}
                aria-expanded={isDiscoveryOpen}
                aria-controls="navigation-discovery-menu"
                onClick={() => setIsDiscoveryOpen((open) => !open)}
              >
                Découvrir
                <FiChevronDown aria-hidden="true" />
              </button>

              {isDiscoveryOpen && (
                <div
                  id="navigation-discovery-menu"
                  className="navigation__discovery-menu"
                >
                  {navigationContent.discoveryLinks.map((link) => (
                    <NavLink key={link.to} to={link.to} onClick={closeMenu}>
                      <span>{link.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="navigation__actions">
            {isAuthenticated ? (
              <>
                <Link
                  to={navigationContent.actions.resources.to}
                  className="btn btn-primary navigation__resources"
                  onClick={closeMenu}
                >
                  {navigationContent.actions.resources.label}
                </Link>
                <NotificationBell onNavigate={closeMenu} />

                <div className="navigation__account">
                  <button
                    type="button"
                    className="btn btn-secondary navigation__account-toggle"
                    aria-expanded={isAccountOpen}
                    onClick={() => setIsAccountOpen((open) => !open)}
                  >
                    {accountLabel}
                    <FiChevronDown aria-hidden="true" />
                  </button>

                  {isAccountOpen && (
                    <div className="navigation__account-menu">
                      <Link to={roleHome(user.role)} onClick={closeMenu}>
                        Accéder à mon espace
                      </Link>
                      <Link to={routes.accountSettings} onClick={closeMenu}>
                        Mon compte et ma sécurité
                      </Link>
                      <button type="button" onClick={handleLogout}>
                        Se déconnecter
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to={navigationContent.actions.login.to}
                  className="navigation__login"
                  onClick={closeMenu}
                >
                  {navigationContent.actions.login.label}
                </Link>
                <Link
                  to={navigationContent.actions.resources.to}
                  className="btn btn-primary"
                  onClick={closeMenu}
                >
                  {navigationContent.actions.resources.label}
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
