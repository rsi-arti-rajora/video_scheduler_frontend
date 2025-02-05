import React, { useState } from "react";
import "./Login.css";
import logo from "./images/RSI-logo.svg";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="login-container">
      <div className="logo-container">
        <img src={logo} alt="RSI Logo" className="logo" />
      </div>

      <div className="login-box">
        <h2>
          Welcome to <strong>R Systems Content Scheduling</strong>
        </h2>
        <div className="progress-bar"></div>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>User Name</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
