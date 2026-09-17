import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { isAdmin, isAuthenticated } from "../utils/auth";

const AdminRoute = ({ children }: { children: ReactNode }) => {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return isAdmin() ? <>{children}</> : <Navigate to="/visit-dashboard" replace />;
};

export default AdminRoute;
