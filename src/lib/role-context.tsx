import { createContext, useContext, useState, type ReactNode } from "react";
import type { RoleId } from "./emfsc-types";
import { ROLES } from "./emfsc-data";

interface RoleContextValue {
  role: RoleId;
  setRole: (r: RoleId) => void;
}

const RoleContext = createContext<RoleContextValue>({ role: "super_admin", setRole: () => {} });

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<RoleId>("super_admin");
  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>;
}

export const useRole = () => useContext(RoleContext);
export const roleDef = (id: RoleId) => ROLES.find((r) => r.id === id)!;
