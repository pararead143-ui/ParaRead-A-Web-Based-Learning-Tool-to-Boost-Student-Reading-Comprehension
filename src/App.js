import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Homepage from "./components/Homepage";
import SummarizationPage from "./components/SummarizationPage";


function App() {
  return (
    <Router>
      <Routes>
        {/* Default route ("/") → goes to Login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Login, Signup, and Homepage routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Homepage />} />
         <Route path="/summary" element={<SummarizationPage />} />
      </Routes>
      
    </Router>
  );
}

export default App;
