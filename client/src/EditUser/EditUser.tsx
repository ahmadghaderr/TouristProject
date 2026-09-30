import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import apiClient from "../api/client";
import { useAuth } from "../utils/auth";
import { getErrorMessage } from "../utils/errors";
import "./editUser.css";

interface UserFormData {
  name: string;
  email: string;
}

const EditUser = () => {
  const { user, logout } = useAuth();
  const userId = user?.id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiClient.get(`/user/user/${userId}`);
        setFormData({
          name: res.data.name,
          email: res.data.email,
        });
      } catch {
        setMessage("Failed to load user data.");
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await apiClient.put(`/user/edit/${userId}`, formData);
      setMessage("User updated successfully!");
    } catch (err) {
      setMessage(getErrorMessage(err, "Error updating user."));
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete your account?");
    if (!confirmDelete) return;

    try {
      await apiClient.delete(`/user/delete/${userId}`);
      setMessage("User deleted successfully!");
      await logout();
      navigate("/login");
    } catch (err) {
      setMessage(getErrorMessage(err, "Error deleting user."));
    }
  };

  return (
    <>
      <Navbar />
      <div className="edit-user-page">
        <h2>Edit User Information</h2>
        {message && (
          <p className={message.includes("successfully") ? "message-success" : "message-error"}>
            {message}
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          <div className="button-row">
            <button type="submit" className="save-btn">
              Save Changes
            </button>
            <button type="button" className="delete-btn" onClick={handleDelete}>
              Delete User
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditUser;
