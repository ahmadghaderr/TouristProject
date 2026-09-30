import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AddVisitPage from "./addVisitPage/AddVisitPage";
import Register from "./Register/Register";
import Login from "./Login/Login";
import EditUser from "./EditUser/EditUser";
import VisitsDashboard from "./visitsDashboard/VisitsDashboard";
import EditVisit from "./EditVisit/EditVisit";
import UsersPage from "./UsersPage/UsersPage";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import { AuthProvider } from "./utils/auth";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/edit-user"
            element={
              <PrivateRoute>
                <EditUser />
              </PrivateRoute>
            }
          />
          <Route
            path="/add-visit"
            element={
              <PrivateRoute>
                <AddVisitPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/visit-dashboard"
            element={
              <PrivateRoute>
                <VisitsDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/edit-visit/:id"
            element={
              <PrivateRoute>
                <EditVisit />
              </PrivateRoute>
            }
          />
          <Route
            path="/users"
            element={
              <AdminRoute>
                <UsersPage />
              </AdminRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
