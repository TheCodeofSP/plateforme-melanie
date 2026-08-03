import toast from "react-hot-toast";

export default function ShareButton({ title, text, url = window.location.href, className = "" }) {
  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text,
          url,
        });

        return;
      }

      await navigator.clipboard.writeText(url);

      toast.success("Lien copié dans le presse-papiers.");
    } catch {
      toast.error("Impossible de partager cette ressource.");
    }
  }

  return (
    <button
      className={`btn btn-secondary share-button ${className}`}
      type="button"
      onClick={handleShare}
    >
      Partager la ressource
    </button>
  );
}
