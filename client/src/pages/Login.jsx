import { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function Login({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleAuth = async (event) => {
    event.preventDefault();

    const cleanedEmail = email.trim();
    const cleanedPassword = password.trim();
    const cleanedUsername = username.trim();

    if (!cleanedEmail || !cleanedPassword || (!isLogin && !cleanedUsername)) {
      setStatus({ type: "error", message: "Please fill in all required fields." });
      return;
    }

    const url = isLogin ? `${API}/api/auth/login` : `${API}/api/auth/register`;

    const payload = {
      email: cleanedEmail,
      password: cleanedPassword,
      ...(isLogin ? {} : { username: cleanedUsername }),
    };

    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await axios.post(url, payload);

      if (isLogin) {
        const loggedInUser = res.data.username || cleanedUsername || cleanedEmail.split("@")[0];

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("username", loggedInUser);
        setUser(loggedInUser);
        return;
      }

      setStatus({
        type: "success",
        message: "Account created successfully. Login with your new credentials.",
      });
      setIsLogin(true);
      setPassword("");
    } catch (error) {
      const apiMessage =
        typeof error?.response?.data === "string"
          ? error.response.data
          : "Authentication failed. Please try again.";

      setStatus({ type: "error", message: apiMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin((prev) => !prev);
    setStatus({ type: "", message: "" });
    setPassword("");
  };

  return (
    <main className="auth-page">
      <section className="auth-layout">
        <aside className="auth-showcase fade-step">
          <p className="tag">Real-time Collaboration</p>
          <h1>Where fast conversations move work forward.</h1>
          <p className="showcase-copy">
            Create focused rooms, share ideas instantly, and keep your team in sync with live
            messaging.
          </p>
          <div className="showcase-pills" aria-label="Feature highlights">
            <span className="showcase-pill">Instant rooms</span>
            <span className="showcase-pill">Live updates</span>
            <span className="showcase-pill">Clean message history</span>
          </div>
        </aside>

        <form className="auth-card fade-step delay-1" onSubmit={handleAuth}>
          <div className="auth-header">
            <p className="tag">{isLogin ? "Welcome Back" : "Create Profile"}</p>
            <h2>{isLogin ? "Login to your account" : "Register a new account"}</h2>
          </div>

          <div className="form-grid">
            {!isLogin && (
              <label className="input-group">
                <span>Username</span>
                <input
                  placeholder="e.g. swastik"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </label>
            )}

            <label className="input-group">
              <span>Email</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label className="input-group">
              <span>Password</span>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          </div>

          {status.message && (
            <p className={`status-banner ${status.type}`} role="status">
              {status.message}
            </p>
          )}

          <button type="submit" className="primary-btn auth-submit" disabled={isLoading}>
            {isLoading ? "Please wait..." : isLogin ? "Login" : "Create account"}
          </button>

          <button type="button" className="text-btn" onClick={toggleAuthMode}>
            {isLogin ? "New here? Create an account" : "Already have an account? Login"}
          </button>
        </form>
      </section>
    </main>
  );
}