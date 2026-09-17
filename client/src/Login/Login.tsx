import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { FaEnvelope } from "react-icons/fa";
import AuthLayout from "../components/AuthLayout";
import IconInput from "../components/IconInput";
import PasswordInput from "../components/PasswordInput";
import apiClient from "../api/client";
import { setSession } from "../utils/auth";
import { getErrorMessage } from "../utils/errors";
import type { JwtPayload } from "../types";
import "../Register/Register.css";

interface LoginFormData {
  email: string;
  password: string;
}

const Login = () => {
  useEffect(() => {
    document.body.classList.add("auth-body");
    document.body.classList.remove("add-visit-body");
    return () => {
      document.body.classList.remove("auth-body");
    };
  }, []);

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await apiClient.post("/user/login", formData);
      const token: string = response.data.token;
      const decoded = jwtDecode<JwtPayload>(token);
      setSession(token, decoded.id, decoded.role || "manager");
      window.location.href = "/add-visit";
    } catch (err) {
      alert(getErrorMessage(err, "Login failed. Please check your email and password."));
    }
  };

  return (
    <AuthLayout
      tagline="Sign in to manage pickups and drop-offs"
      onSubmit={handleSubmit}
      footer={
        <p>
          Don't have an account? <a href="/register">Register here</a>
        </p>
      }
    >
      <IconInput
        icon={FaEnvelope}
        name="email"
        type="email"
        placeholder="Enter your email"
        onChange={handleChange}
        value={formData.email}
        required
      />

      <PasswordInput
        name="password"
        placeholder="Enter your password"
        onChange={handleChange}
        value={formData.password}
        required
      />

      <button type="submit">Login</button>
    </AuthLayout>
  );
};

export default Login;
