import React, { useState } from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("http://127.0.0.1:8000/api/token/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      alert("Login successful!");
      navigate("/home"); // ✅ Navigate directly after login
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="login-container">
      <div className="left-side">
        <h1 className="title">PARAREAD</h1>
        <p className="subtitle">READ SMARTER,<br />UNDERSTAND BETTER</p>
        <div className="logo-circle">
          <img src="/logo.png" alt="ParaRead Logo" />
        </div>
        <p className="tagline">A WEB-BASED LEARNING TOOL TO BOOST STUDENT UNDERSTANDING</p>
      </div>

      <div className="right-side">
        <h2>JOIN NOW!</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Email, username, or phone number"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        <a href="#">Forgot Password?</a>
        <p>Don’t have an account? <Link to="/signup">Signup</Link></p>
      </div>
    </div>
  );
}

export default Login;
