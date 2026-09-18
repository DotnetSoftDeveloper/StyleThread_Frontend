import { Navigate } from "react-router-dom";
import { useAuth } from "./Pages/Login/useAuth";
import NoContentFound from "./NoContentFound";
import { useEffect, useRef, useState } from "react";
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar";
import React from "react";
import { useToast } from "./Utils/Helper/ToastNotifications";

// Define props interface
interface ProtectedRouteProps {
  element: React.ComponentType;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  element: Element,
  allowedRoles
}) => {
  const { role, token } = useAuth(); // Get the user's role and token from AuthContext
  const loadingRef = useRef<LoadingBarRef | null>(null);
  const [redirect, setRedirect] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!token) {
      loadingRef.current?.continuousStart(); // Start the loading bar
      showToast("error", "Please Login first.");
      setTimeout(() => {
        loadingRef.current?.complete(); // Stop loader after delay
        setRedirect(true); // Trigger redirect after loader completes
      }, 500);
    }
  }, [token, showToast]);

  // Show the loading bar
  if (redirect) {
    return <Navigate to="/signin" replace />;
  }

  // If the user's role is not allowed, show "NoContentFound"
  if (token && !allowedRoles.includes(role ?? "")) {
    return <NoContentFound />;
  }

  // If everything is valid, render the component
  return (
    <>
      <LoadingBar color="#f11946" ref={loadingRef} />
      <Element />
    </>
  );
};

export default ProtectedRoute;
