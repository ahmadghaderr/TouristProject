import { FormEvent, ReactNode } from "react";

interface AuthLayoutProps {
  tagline: string;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  footer: ReactNode;
}

const AuthLayout = ({ tagline, onSubmit, children, footer }: AuthLayoutProps) => (
  <div
    className="auth-screen"
    style={{
      backgroundImage: `linear-gradient(180deg, rgba(21,24,27,0.55) 0%, rgba(21,24,27,0.85) 100%), url(${process.env.PUBLIC_URL}/images/BeirutImage.jpg)`,
    }}
  >
    <div className="auth-page">
      <form onSubmit={onSubmit} className="auth-form">
        <div className="auth-form-header">
          <h2>Tourist</h2>
          <p className="auth-form-tagline">{tagline}</p>
          <span className="auth-rule"></span>
        </div>

        {children}

        {footer}
      </form>
    </div>
  </div>
);

export default AuthLayout;
