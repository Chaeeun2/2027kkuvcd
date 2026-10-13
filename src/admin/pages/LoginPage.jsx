import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function LoginPage() {
  const { login, status } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (status === "admin") {
    return <Navigate to={location.state?.from ?? "/admin/about"} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (loginError) {
      setError(loginError.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-login">
      <form className="admin-login__card" onSubmit={handleSubmit}>
        <h1 className="admin-login__title">HELLO WORLD Admin</h1>
        {status === "unconfigured" ? (
          <p className="admin-error">
            Firebase 설정(.env.local)이 없어 로그인할 수 없습니다.
          </p>
        ) : null}
        {error ? <p className="admin-error">{error}</p> : null}

        <label className="admin-field">
          <span className="admin-field__label">이메일</span>
          <input
            autoComplete="username"
            className="admin-input"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>
        <label className="admin-field">
          <span className="admin-field__label">비밀번호</span>
          <input
            autoComplete="current-password"
            className="admin-input"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>

        <button
          className="admin-button admin-button--primary admin-button--block"
          disabled={isSubmitting || status === "unconfigured" || status === "loading"}
          type="submit"
        >
          {isSubmitting ? "로그인 중..." : "로그인"}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
