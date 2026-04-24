import { useState } from "react";
import "./App.css";
import Login from "./pages/Login";
import Chat from "./pages/Chat";

function App() {
  const [user, setUser] = useState(() => localStorage.getItem("username") || "");

  const handleSetUser = (username) => {
    if (!username) return;
    localStorage.setItem("username", username);
    setUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUser("");
  };

  if (!localStorage.getItem("token")) {
    return <Login setUser={handleSetUser} />;
  }

  if (!user) {
    return <Login setUser={handleSetUser} />;
  }

  return (
    <div className="app-shell">
      <Chat user={user} onLogout={handleLogout} />
    </div>
  );
}

export default App;