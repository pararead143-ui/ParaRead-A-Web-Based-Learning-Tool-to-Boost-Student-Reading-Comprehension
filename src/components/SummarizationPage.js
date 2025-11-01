import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/sidebar"; // ✅ Reusable sidebar
import "./Homepage.css";

function SummarizationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [readingId] = useState(location.state?.id);
  const [segmentedText] = useState(location.state?.segments || "");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);




  // ✅ Added: logout handler
  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  };

  const handleSummarize = async () => {
    if (!segmentedText) return alert("No text to summarize!");
    setLoading(true);
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(`http://127.0.0.1:8000/api/readings/${readingId}/summarize/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: segmentedText }),
      });
      if (!res.ok) throw new Error("Summarization failed");
      const data = await res.json();
      setSummary(data.summary);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="homepage-wrapper">
      {/* ✅ Reusable Sidebar with logout */}
      <Sidebar activePage="summary" onLogout={handleLogout} />

      {/* Main content */}
      <main className="content">
        <h1 className="main-title">SUMMARY</h1>

        <textarea className="text-area" value={segmentedText} readOnly />

        <div className="action-buttons">
          <button className="segment-button" onClick={handleSummarize}>
            {loading ? "Summarizing..." : "Summarize"}
          </button>
        </div>

        <textarea
          className="text-area summary-output"
          value={summary}
          readOnly
          placeholder="Summary will appear here..."
        />
      </main>
    </div>
  );
}

export default SummarizationPage;
