import { useState } from "react";

import { removeReaction, setReaction } from "../api/safe-place.service.js";
import { reactionOptions } from "../config/safe-place.config.js";

export default function ReactionBar({ target, id, currentReaction, counters = {}, disabled = false }) {
  const [current, setCurrent] = useState(currentReaction);
  const [counts, setCounts] = useState(counters.reactions || counters);
  const [busy, setBusy] = useState(false);
  async function choose(type) {
    if (busy || disabled) return;
    setBusy(true);
    try {
      if (current === type) {
        await removeReaction(target, id);
        setCounts((value) => ({ ...value, [type]: Math.max(0, (value?.[type] || 0) - 1) }));
        setCurrent(null);
      } else {
        await setReaction(target, id, type);
        setCounts((value) => ({ ...value, ...(current && { [current]: Math.max(0, (value?.[current] || 0) - 1) }), [type]: (value?.[type] || 0) + 1 }));
        setCurrent(type);
      }
    } finally { setBusy(false); }
  }
  return <div className="clearing-reactions" aria-label="Réactions">{reactionOptions.map((reaction) => <button key={reaction.value} type="button" disabled={busy || disabled} className={current === reaction.value ? "is-selected" : ""} aria-pressed={current === reaction.value} onClick={() => choose(reaction.value)}><span aria-hidden="true">{reaction.symbol}</span> {reaction.label}{counts?.[reaction.value] ? ` · ${counts[reaction.value]}` : ""}</button>)}</div>;
}
