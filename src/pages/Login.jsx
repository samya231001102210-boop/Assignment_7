import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getPasswordStrength } from "../utils/passwordStrength";

const validate = (username, password) => {
  const errors = {};
  if (!username.trim()) errors.username = "Username is required";
  if (!password) errors.password = "Password is required";
  return errors;
};

const Login = () => {
  const rememberedUser = localStorage.getItem("rememberedUsername") || "";

  const [username, setUsername] = useState(rememberedUser);
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(!!rememberedUser);
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const { isLoggedIn, login } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const errors = validate(username, password);
  const strength = getPasswordStrength(password);

  // Already logged in (or just logged in) -> go to the dashboard / last page
  if (isLoggedIn) return <Navigate to={from} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ username: true, password: true });
    setServerError("");

    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    const result = await login(username.trim(), password, remember);
    setLoading(false);

    if (!result.success) setServerError(result.error);
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <h2>Task Manager Login</h2>

        {serverError && <p className="error">{serverError}</p>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          className={touched.username && errors.username ? "input-invalid" : ""}
          onChange={(e) => setUsername(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, username: true }))}
        />
        {touched.username && errors.username && (
          <p className="field-error">{errors.username}</p>
        )}

        <input
          type="password"
          placeholder="Password"
          value={password}
          className={touched.password && errors.password ? "input-invalid" : ""}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
        />
        {touched.password && errors.password && (
          <p className="field-error">{errors.password}</p>
        )}

        {password && (
          <div className="strength">
            <div className="strength-bar">
              {[1, 2, 3, 4].map((level) => (
                <span
                  key={level}
                  className={
                    level <= strength.score
                      ? `segment active level-${strength.score}`
                      : "segment"
                  }
                />
              ))}
            </div>
            <p className={`strength-label level-${strength.score}`}>
              Password strength: {strength.label}
            </p>
            {strength.tips.length > 0 && (
              <p className="strength-tips">
                Add: {strength.tips.join(", ")}
              </p>
            )}
          </div>
        )}

        <label className="remember">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          Remember me
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="hint">Demo: admin / 1234</p>
      </form>
    </div>
  );
};

export default Login;
