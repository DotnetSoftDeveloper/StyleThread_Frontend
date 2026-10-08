import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./Pages/Login/useAuth";

interface PublicRouteProps {
  element: React.ComponentType | React.ReactElement;
  redirectTo?: string;
}

/**
 * Route wrapper that prevents authenticated users from accessing
 * guest-only pages like /signin, /signup, /forgot-password.
 * If user already has an active token, redirects them to /home.
 */
const PublicRoute: React.FC<PublicRouteProps> = ({
  element,
  redirectTo = "/home"
}) => {
  const { token } = useAuth();

  if (token) {
    return <Navigate to={redirectTo} replace />;
  }

  return React.isValidElement(element) ? element : React.createElement(element);
};

export default PublicRoute;
