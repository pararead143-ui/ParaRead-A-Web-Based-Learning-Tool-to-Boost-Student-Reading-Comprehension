import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Homepage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      setUsername("Welcome back!"); // Later, fetch username from API if needed
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="home-container">
      <h2>ParaRead Dashboard</h2>
      <p>{username}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Homepage;
