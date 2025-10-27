import React from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Home from "./components/Homepage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginRedirect />} />
        <Route path="/login" element={<LoginRedirect />} /> {/* 👈 ADD THIS */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/homepage" element={<Home />} />
      </Routes>
    </Router>
  );
}

function LoginRedirect() {
  const navigate = useNavigate();
  return <Login onLogin={() => navigate("/home")} />;
}

export default App;
