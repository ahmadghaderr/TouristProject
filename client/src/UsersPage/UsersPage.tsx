import { useEffect, useState } from "react";
import moment from "moment";
import { FaTrash } from "react-icons/fa";
import Navbar from "../Navbar/Navbar";
import Icon from "../components/Icon";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import SummaryStats from "../components/SummaryStats";
import apiClient from "../api/client";
import { useAuth } from "../utils/auth";
import type { User } from "../types";
import "./UsersPage.css";

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useAuth();
  const currentUserId = currentUser?.id;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<User[]>("/user/all");
      setUsers(response.data);
      setError(null);
    } catch {
      setError("Error loading users");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await apiClient.delete(`/user/delete/${userId}`);
      setUsers(users.filter((u) => String(u._id) !== String(userId)));
    } catch {
      alert("Failed to delete user");
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  const adminCount = users.filter((u) => u.role === "admin").length;

  return (
    <>
      <Navbar />
      <div className="users-page-container">
        <div className="dashboard-header">
          <h1>Users</h1>
          <span className="panel-rule"></span>
          <SummaryStats
            stats={[
              { label: "Total", value: users.length },
              { label: "Admins", value: adminCount, className: "admin" },
              { label: "Managers", value: users.length - adminCount },
            ]}
          />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-state">
                    No users available.
                  </td>
                </tr>
              ) : null}
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name || "-"}</td>
                  <td>{user.email || "-"}</td>
                  <td>
                    <span className={`role-indicator ${user.role === "admin" ? "admin" : "manager"}`}>
                      {user.role === "admin" ? "Admin" : "Manager"}
                    </span>
                  </td>
                  <td>{user.createdAt ? moment(user.createdAt).format("MMM D, YYYY") : "-"}</td>
                  <td className="actions-cell">
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(user._id)}
                      disabled={String(user._id) === String(currentUserId)}
                      title={
                        String(user._id) === String(currentUserId)
                          ? "You can't delete your own account here"
                          : "Delete user"
                      }
                    >
                      <Icon icon={FaTrash} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default UsersPage;
