import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import Reconnecting from "./Reconnecting";
import { useAuth } from "../utils/auth";

const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { loading, authCheckFailed, isAuthenticated, isAdmin } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) {
    return authCheckFailed ? <Reconnecting /> : <Navigate to="/login" replace />;
  }
  return isAdmin ? <>{children}</> : <Navigate to="/visit-dashboard" replace />;
};

export default AdminRoute;
