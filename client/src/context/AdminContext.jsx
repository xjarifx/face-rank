import { createContext, useContext, useState, useCallback } from "react";
import { loginAdmin as loginAdminApi } from "../api";

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");

  const loginAdmin = useCallback(async (password) => {
    await loginAdminApi(password);
    setIsAdmin(true);
    setAdminPassword(password);
  }, []);

  const logoutAdmin = useCallback(() => {
    setIsAdmin(false);
    setAdminPassword("");
  }, []);

  return (
    <AdminContext.Provider
      value={{ isAdmin, adminPassword, loginAdmin, logoutAdmin }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
