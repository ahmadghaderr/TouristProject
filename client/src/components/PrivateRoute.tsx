import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import Reconnecting from "./Reconnecting";
import { useAuth } from "../utils/auth";

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { loading, authCheckFailed, isAuthenticated } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (isAuthenticated) return <>{children}</>;
  return authCheckFailed ? <Reconnecting /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
