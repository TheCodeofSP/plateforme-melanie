import { useContext } from "react";

import { AuthContext } from "../contexts/auth-context.js";

export default function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth doit être utilisé dans AuthProvider.");
  }

  return context;
}
