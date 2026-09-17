import { ReactNode } from "react";

interface FormGroupProps {
  label: string;
  children: ReactNode;
  className?: string;
}

const FormGroup = ({ label, children, className }: FormGroupProps) => (
  <div className={["form-group", className].filter(Boolean).join(" ")}>
    <label>{label}</label>
    {children}
  </div>
);

export default FormGroup;
