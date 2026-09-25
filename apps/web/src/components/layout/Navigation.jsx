import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";
import { navigationContent } from "../../content/navigation.content.js";
import { roleHome, routes } from "../../config/routes.config.js";
import useAuth from "../../hooks/useAuth.js";
import { getUnreadCount } from "../../features/notifications/api/notification.service.js";
import logoMelanie from "../../assets/images/logo-clairiere.png";
import "../../styles/layouts/navigation.scss";

function NavigationDropdown({ id, label, links, open, active, onOpen, onClose, onNavigate }) {
  return (
    <div
      className={`navigation__dropdown ${open ? "is-open" : ""}`}
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onClose();
      }}
    >
      <button
        type="button"
        className={`navigation__link navigation__dropdown-toggle ${active ? "navigation__link--active" : ""}`}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => (open ? onClose() : onOpen())}
      >
        {label}
        <FiChevronDown aria-hidden="true" />
      </button>
      <div id={id} className="navigation__dropdown-menu">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} onClick={onNavigate}>
            {link.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigationRef = useRef(null);
  const { pathname } = useLocation();
  const { isAuthenticated, logout, user } = useAuth();
  const closeMenu = () => {
    setIsMenuOpen(false);
    setOpenDropdown(null);
  };
  const isGroupActive = (links) =>
    links.some(({ to }) => pathname === to || pathname.startsWith(`${to}/`));
  const memberLabel = user?.pseudonym || user?.firstName || "Mon espace";

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    getUnreadCount()
      .then((counts) => setUnreadCount(counts.total || 0))
      .catch(() => setUnreadCount(0));
  }, [isAuthenticated, pathname]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") closeMenu();
    };
    const handleOutsideClick = (event) => {
      if (navigationRef.current && !navigationRef.current.contains(event.target)) closeMenu();
    };
    window.addEventListener("keydown", handleEscape);
    document.addEventListener("pointerdown", handleOutsideClick);
    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.removeEventListener("pointerdown", handleOutsideClick);
    };
  }, []);

  async function handleLogout() {
    await logout();
    closeMenu();
  }

  return (
    <header className="navigation" ref={navigationRef}>
      <div className="page-container navigation__container">
        <div className="navigation__brand-group">
          <Link to="/" className="navigation__brand" onClick={closeMenu}>
            <img src={logoMelanie} alt="" />
            <span>{navigationContent.brand}</span>
          </Link>
          {isAuthenticated && (
            <div className={`navigation__identity ${openDropdown === "account" ? "is-open" : ""}`}>
              <span aria-hidden="true">×</span>
              <button
                type="button"
                className="navigation__identity-toggle"
                aria-expanded={openDropdown === "account"}
                onClick={() =>
                  setOpenDropdown((current) => (current === "account" ? null : "account"))
                }
              >
                {memberLabel}
                {unreadCount > 0 && (
                  <span
                    className="navigation__notification-badge"
                    aria-label={`${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}`}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
                <FiChevronDown aria-hidden="true" />
              </button>
              <div className="navigation__account-menu">
                <Link to={roleHome(user.role)} onClick={closeMenu}>
                  Accéder à mon espace
                </Link>
                <Link to={routes.notifications} onClick={closeMenu}>
                  Mes notifications{unreadCount ? ` (${unreadCount})` : ""}
                </Link>
                <Link to={routes.accountSettings} onClick={closeMenu}>
                  Mon compte et ma sécurité
                </Link>
                <button type="button" onClick={handleLogout}>
                  Se déconnecter
                </button>
              </div>
            </div>
          )}
        </div>
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
        <nav
          id="main-navigation-menu"
          className={`navigation__menu ${isMenuOpen ? "navigation__menu--open" : ""}`}
          aria-label="Navigation principale"
        >
          <div className="navigation__links">
            <NavigationDropdown
              id="navigation-clairiere-menu"
              label="La Clairière"
              links={navigationContent.clairiereLinks}
              open={openDropdown === "clairiere"}
              active={isGroupActive(navigationContent.clairiereLinks)}
              onOpen={() => setOpenDropdown("clairiere")}
              onClose={() =>
                setOpenDropdown((current) => (current === "clairiere" ? null : current))
              }
              onNavigate={closeMenu}
            />
            <NavigationDropdown
              id="navigation-discovery-menu"
              label="Découvrir"
              links={navigationContent.discoveryLinks}
              open={openDropdown === "discovery"}
              active={isGroupActive(navigationContent.discoveryLinks)}
              onOpen={() => setOpenDropdown("discovery")}
              onClose={() =>
                setOpenDropdown((current) => (current === "discovery" ? null : current))
              }
              onNavigate={closeMenu}
            />
            <NavLink
              to={routes.contact}
              onClick={closeMenu}
              className={({ isActive }) =>
                `navigation__link${isActive ? " navigation__link--active" : ""}`
              }
            >
              Contact
            </NavLink>
          </div>
          <div className="navigation__actions">
            <Link
              to={navigationContent.actions.resources.to}
              className="btn btn-primary navigation__resources"
              onClick={closeMenu}
            >
              {navigationContent.actions.resources.label}
            </Link>
            {!isAuthenticated && (
              <Link
                to={navigationContent.actions.login.to}
                className="navigation__login"
                onClick={closeMenu}
              >
                {navigationContent.actions.login.label}
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
