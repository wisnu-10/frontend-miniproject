import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

interface ProtectedRouteProps {
  allowedRoles?: ("CUSTOMER" | "ORGANIZER")[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    const isOrganizerRoute =
      allowedRoles?.includes("ORGANIZER") && !allowedRoles?.includes("CUSTOMER");
    const redirectPath = isOrganizerRoute ? "/organizer/login" : "/login";
    return <Navigate to={redirectPath} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // Or a specific "Unauthorized" page
  }

  return <Outlet />;
};

export default ProtectedRoute;
