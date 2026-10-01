import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import { useAuth } from "../utils/auth";

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { loading, isAuthenticated } = useAuth();
  if (loading) return <LoadingSpinner />;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
