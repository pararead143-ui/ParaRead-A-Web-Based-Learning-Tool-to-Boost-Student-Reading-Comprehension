import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import "./Homepage.css";

function Homepage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [readingId, setReadingId] = useState(null); // ✅ Added: store reading ID

  // ✅ Redirect to login if no token
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) navigate("/login");
    else setUsername("Welcome back!");
  }, [navigate]);

  // ✅ Handle file change
  const handleFileChange = (e) => setFile(e.target.files[0]);

  // ✅ Handle logout
  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  };

  // ✅ Upload or segment text
  const handleUpload = async () => {
    const token = localStorage.getItem("access");
    if (!token) return alert("Please login again.");
    if (!file && !text.trim()) return alert("Please select a file or paste text!");

    setLoading(true);
    try {
      let reading;
      if (file) {
        const formData = new FormData();
        formData.append("title", file.name);
        formData.append("file", file);

        const uploadRes = await fetch("http://127.0.0.1:8000/api/readings/", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!uploadRes.ok) throw new Error("Upload failed");
        reading = await uploadRes.json();
      } else {
        const uploadRes = await fetch("http://127.0.0.1:8000/api/readings/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title: "Pasted Text", content: text }),
        });
        if (!uploadRes.ok) throw new Error("Text upload failed");
        reading = await uploadRes.json();
      }

      // ✅ Store reading ID for summarization later
      setReadingId(reading.id);

      const segmentRes = await fetch(
        `http://127.0.0.1:8000/api/readings/${reading.id}/segment/`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!segmentRes.ok) throw new Error("Segmentation failed");
      const segmentedData = await segmentRes.json();

      const combinedText = (segmentedData.segments || [])
        .map((s, i) => `Segment ${i + 1}:\n${s.segment_text}`)
        .join("\n\n");

      setText(combinedText || "No segments returned.");
    } catch (error) {
      console.error(error);
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Go to summary page (with readingId)
  const goToSummary = () => {
    if (!text.trim()) return alert("No segmented text to summarize!");
    if (!readingId) return alert("Reading ID not found. Please re-upload the text.");
    navigate("/summary", { state: { id: readingId, segments: text } });
  };

  return (
    <div className="homepage-wrapper">
      <Sidebar activePage="home" onLogout={handleLogout} />

      <main className="content">
        <h1 className="main-title">READ SMARTER, UNDERSTAND BETTER</h1>

        <textarea
          className="text-area"
          placeholder="Paste text here to segment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="action-buttons">
          <label htmlFor="file-upload" className="upload-button">
            Upload file
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".pdf,.docx,.pptx,.txt"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          {file && (
            <div className="file-preview">
              <span className="file-name">📄 {file.name}</span>
              <button
                className="cancel-file"
                onClick={() => {
                  setFile(null);
                  document.getElementById("file-upload").value = null;
                }}
              >
                ✖
              </button>
            </div>
          )}

          <button className="segment-button" onClick={handleUpload}>
            {loading ? "Processing..." : "Segment"}
          </button>

          <button
            className="clear-button"
            onClick={() => {
              setText("");
              setFile(null);
              setReadingId(null);
              document.getElementById("file-upload").value = null;
            }}
          >
            Clear
          </button>

          {text.trim() && (
            <button className="summary-button" onClick={goToSummary}>
              Go to Summary
            </button>
          )}
        </div>

        <p className="footer">
          A WEB-BASED LEARNING TOOL TO BOOST STUDENT UNDERSTANDING
        </p>
      </main>
    </div>
  );
}

export default Homepage;
