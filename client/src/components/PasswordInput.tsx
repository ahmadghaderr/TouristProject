import { useState, InputHTMLAttributes } from "react";
import { FaLock } from "react-icons/fa";
import { IoEyeOff, IoEye } from "react-icons/io5";
import Icon from "./Icon";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

const PasswordInput = (inputProps: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="input-group">
      <div className="icon-container">
        <Icon icon={FaLock} className="input-icon" />
      </div>
      <input {...inputProps} type={showPassword ? "text" : "password"} />
      <button
        type="button"
        className="toggle-password-btn"
        onClick={() => setShowPassword((prev) => !prev)}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        <Icon icon={showPassword ? IoEyeOff : IoEye} className="toggle-icon" />
      </button>
    </div>
  );
};

export default PasswordInput;
