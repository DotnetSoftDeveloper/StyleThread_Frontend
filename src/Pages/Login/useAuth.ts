import { useContext } from "react";
import { AuthContext } from "./AuthContext"; // Adjust path as needed


export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
