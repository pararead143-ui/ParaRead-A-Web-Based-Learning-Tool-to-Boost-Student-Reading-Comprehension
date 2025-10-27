import React, { useState } from "react";
import "./Login.css";
import { Link } from "react-router-dom";

function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // simple frontend check
    if (formData.password !== formData.password2) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/users/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Account created successfully! You can now log in.");
        window.location.href = "/login";
      } else {
        const data = await response.json();
        console.error("Signup error:", data);
        alert("Signup failed: " + JSON.stringify(data));
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Network error. Please check your connection.");
    }
  };

  return (
    <div className="login-container">
      <div className="left-side">
        <h1 className="title">PARAREAD</h1>
        <p className="subtitle">
          READ SMARTER,<br />UNDERSTAND BETTER
        </p>
        <div className="logo-circle">
          <img src="/logo.png" alt="ParaRead Logo" />
        </div>
        <p className="tagline">
          A WEB-BASED LEARNING TOOL TO BOOST STUDENT UNDERSTANDING
        </p>
      </div>

      <div className="right-side">
        <h2>CREATE ACCOUNT</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="username"
            placeholder="Username"
            onChange={handleChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />
          <input
            name="password2"
            type="password"
            placeholder="Confirm Password"
            onChange={handleChange}
            required
          />
          <button type="submit">Sign Up</button>
        </form>
        <p>
          Already have an account?{" "}
          <a href="http://localhost:3000/login">Login</a>
        </p>
      </div>
    </div>
  );
}

export default Signup;
