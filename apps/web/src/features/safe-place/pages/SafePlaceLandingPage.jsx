import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import ErrorState from "../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { routes } from "../../../config/routes.config.js";
import { safePlaceContent } from "../../../content/safe-place.content.js";
import useAuth from "../../../hooks/useAuth.js";
import {
  getCategories,
  getPosts,
  getSafePlaceAccess,
} from "../api/safe-place.service.js";
import CategoryCard from "../components/CategoryCard.jsx";
import PostCard from "../components/PostCard.jsx";
import SafePlaceShell from "../components/SafePlaceShell.jsx";

import "../../../styles/pages/safe-place/safe-place.scss";

export default function SafePlaceLandingPage() {
  const { isAuthenticated, status } = useAuth();
  const [access, setAccess] = useState(null);
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!isAuthenticated) return;
    getSafePlaceAccess()
      .then(async (result) => {
        setAccess(result);
        if (result.allowed) {
          const [categoryItems, postData] = await Promise.all([
            getCategories(),
            getPosts({ page: 1, limit: 6, sort: "active" }),
          ]);
          setCategories(categoryItems);
          setPosts(postData.posts);
        }
      })
      .catch(setError);
  }, [isAuthenticated]);
  if (status === "checking") return <PageLoader />;
  if (!isAuthenticated) return <PublicIntroduction />;
  if (error)
    return (
      <SafePlaceShell>
        <ErrorState
          title="Le forum est momentanément inaccessible"
          description={error.message}
        />
      </SafePlaceShell>
    );
  if (!access) return <PageLoader />;
  if (!access.allowed && access.reason === "SAFE_PLACE_ROLE_FORBIDDEN")
    return (
      <SafePlaceShell compact>
        <p className="section-eyebrow">Deux espaces, deux intentions</p>
        <h1>Ton compte professionnel reste distinct</h1>
        <p>
          Pour préserver la confidentialité de cet espace, une intervenante
          participe uniquement avec un compte membre personnel.
        </p>
        <Link className="btn btn-primary" to={routes.intervenantHome}>
          Retour à mon espace professionnel
        </Link>
      </SafePlaceShell>
    );
  if (!access.allowed && access.reason === "SAFE_PLACE_CHARTER_REQUIRED")
    return (
      <SafePlaceShell compact>
        <p className="section-eyebrow">Une étape avant d’entrer</p>
        <h1>La charte ouvre l’accès au forum</h1>
        <p>
          Ton compte est bien actif, mais l’accès aux discussions reste protégé
          tant que tu n’as pas lu et accepté la charte du forum de La Clairière.
        </p>
        <div className="clearing-access-steps">
          <p>
            <strong>1.</strong> Lis les engagements communs.
          </p>
          <p>
            <strong>2.</strong> Confirme que tu souhaites les respecter.
          </p>
          <p>
            <strong>3.</strong> Entre dans le forum et participe aux échanges.
          </p>
        </div>
        <Link className="btn btn-primary" to={routes.communityCharter}>
          Lire et accepter la charte
        </Link>
      </SafePlaceShell>
    );
  if (!access.allowed)
    return (
      <SafePlaceShell compact>
        <p className="section-eyebrow">Accès suspendu</p>
        <h1>Ton accès à cet espace est temporairement indisponible</h1>
        <p>
          Tu peux retrouver les informations disponibles dans ton espace membre.
        </p>
        <Link className="btn btn-primary" to={routes.memberHome}>
          Retour à mon espace
        </Link>
      </SafePlaceShell>
    );
  return (
    <SafePlaceShell>
      <SEO title={safePlaceContent.name} noIndex />
      <header className="clearing-hero">
        <p className="section-eyebrow">{safePlaceContent.landing.eyebrow}</p>
        <h1>{safePlaceContent.landing.title}</h1>
        <p>{safePlaceContent.landing.introduction}</p>
        <p className="clearing-privacy">{safePlaceContent.landing.privacy}</p>
        <Link className="btn btn-primary" to={routes.communityNewDiscussion}>
          Ouvrir une discussion
        </Link>
      </header>
      <section>
        <h2>Les espaces du forum</h2>
        <div className="clearing-categories">
          {categories.map((category) => (
            <CategoryCard key={category._id} category={category} />
          ))}
        </div>
      </section>
      <section>
        <h2>Les échanges récents</h2>
        <div className="clearing-posts">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </section>
    </SafePlaceShell>
  );
}

function PublicIntroduction() {
  return (
    <main className="safe-place-public">
      <SEO
        title={safePlaceContent.name}
        description={safePlaceContent.landing.introduction}
      />
      <section>
        <p className="section-eyebrow">{safePlaceContent.landing.eyebrow}</p>
        <h1>{safePlaceContent.name}</h1>
        <p>{safePlaceContent.landing.introduction}</p>
        <p>
          Un lieu confidentiel, bienveillant et sécurisant où les membres
          échangent sous leur pseudonyme.
        </p>
        <div>
          <Link
            className="btn btn-primary"
            to={routes.login}
            state={{ from: routes.community }}
          >
            Se connecter
          </Link>
          <Link className="btn btn-secondary" to={routes.registration}>
            Créer un compte
          </Link>
        </div>
      </section>
    </main>
  );
}
