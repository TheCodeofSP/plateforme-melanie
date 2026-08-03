import { useEffect } from "react";

export default function useQuizLeaveGuard(active) {
  useEffect(() => {
    if (!active) return undefined;
    function warnBeforeLeaving(event) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [active]);
}
