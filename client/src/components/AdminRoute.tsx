import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import { useAuth } from "../utils/auth";

const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return isAdmin ? <>{children}</> : <Navigate to="/visit-dashboard" replace />;
};

export default AdminRoute;
