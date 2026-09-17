import { InputHTMLAttributes } from "react";
import type { IconType } from "react-icons";
import Icon from "./Icon";

interface IconInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: IconType;
}

const IconInput = ({ icon, ...inputProps }: IconInputProps) => (
  <div className="input-group">
    <div className="icon-container">
      <Icon icon={icon} className="input-icon" />
    </div>
    <input {...inputProps} />
  </div>
);

export default IconInput;
