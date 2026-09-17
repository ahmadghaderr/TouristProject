import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { FaUser, FaEnvelope } from "react-icons/fa";
import AuthLayout from "../components/AuthLayout";
import IconInput from "../components/IconInput";
import PasswordInput from "../components/PasswordInput";
import apiClient from "../api/client";
import { getErrorMessage } from "../utils/errors";
import "./Register.css";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

const Register = () => {
  useEffect(() => {
    document.body.classList.add("auth-body");
    document.body.classList.remove("add-visit-body");
    return () => {
      document.body.classList.remove("auth-body");
    };
  }, []);

  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await apiClient.post("/user/register", formData);
      alert(res.data.msg || "Account created. Check your email to verify before logging in.");
      window.location.href = "/login";
    } catch (err) {
      alert(getErrorMessage(err, "Signup failed. Please check your details and try again."));
    }
  };

  return (
    <AuthLayout
      tagline="Create an account to start logging visits"
      onSubmit={handleSubmit}
      footer={
        <p>
          Already have an account? <a href="/login">Login here</a>
        </p>
      }
    >
      <IconInput
        icon={FaUser}
        name="name"
        type="text"
        placeholder="Enter your name"
        onChange={handleChange}
        value={formData.name}
        required
      />

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

      <button type="submit">Register</button>
    </AuthLayout>
  );
};

export default Register;
