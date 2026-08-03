import { describe, expect, it } from "vitest";

import { calculateAge, maskEmail, passwordChecks } from "./registration.utils.js";

describe("registration.utils", () => {
  it("calcule l’âge en tenant compte de la date anniversaire", () => {
    expect(calculateAge("2008-08-01", new Date("2026-07-25T12:00:00"))).toBe(17);
    expect(calculateAge("2008-07-01", new Date("2026-07-25T12:00:00"))).toBe(18);
  });

  it("masque une adresse email sans masquer son domaine", () => {
    expect(maskEmail("lea.martin@example.com")).toBe("le••••••••@example.com");
  });

  it("vérifie chaque règle du mot de passe", () => {
    expect(Object.values(passwordChecks("MotDePasse1!")).every(Boolean)).toBe(true);
  });
});
