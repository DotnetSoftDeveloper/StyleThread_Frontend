import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

const AuthRedirect: React.FC = () => {
  const { token } = useAuth();

  // Navigate to the home page if logged in, otherwise go to the login page
  return token ? <Navigate to="/home" replace /> : <Navigate to="/signin" replace />;
};

export default AuthRedirect;
