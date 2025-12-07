import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { writeCode } from "../helpers/code/writeCode";
import { clearCode } from "../helpers/code/genCodeSlice";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { setUser } from "../helpers/user/userSlice";
import html2canvas from "html2canvas";

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const generatedPage = useSelector((state) => state.generatedPage);
  const generatedCode = generatedPage.code;
  const user = useSelector((state) => state.user);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [siteImage, setSiteImage] = useState(null);

  const quirkyMessages = [
    "Herding pixels...",
    "Polishing pixels...",
    "Feeding the cat...",
    "Tuning the HTML engine...",
    "Summoning JavaScript sprites...",
    "Aligning CSS unicorns...",
    "So....How's It Going?",
    "Have You Watched Arcane Yet?"
  ];

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % quirkyMessages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [loading]);

  const generatePage = async (phrase) => {
    if (!phrase.trim()) return;
    try {
      setLoading(true);
      setStatus(quirkyMessages[0]);
      const result = await writeCode(phrase);
      setStatus(result.success ? "Page generated and saved!" : "Error: " + result.error);
    } catch (err) {
      setStatus("⚠️ Unexpected error.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    generatePage(query);
  };

  const handleRandom = () => {
    const randomPhrase = "A Random Website";
    setQuery(randomPhrase);
    generatePage(randomPhrase);
  };

  const captureScreenshot = async (title) => {
    try {
      alert(
        "Please take a screenshot of the page (Print Screen or Snipping Tool) " +
        "then press Ctrl+V / Cmd+V to paste it."
      );

      // Listen for the paste event once
      const clipboardEvent = await new Promise((resolve, reject) => {
        const handler = (e) => {
          e.preventDefault();
          document.removeEventListener("paste", handler);

          const items = e.clipboardData?.items;
          if (!items) return reject("No clipboard items found");

          for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith("image/")) {
              resolve(items[i].getAsFile());
              return;
            }
          }
          reject("No image found in clipboard");
        };
        document.addEventListener("paste", handler);
      });

      if (!clipboardEvent) return null;

      const file = clipboardEvent; // This is a File object

      // Upload logic
      const step1Res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/get/file/url/local`,
        { params: { step: 1 } }
      );

      const uploadUrl = step1Res.data?.payload?.uploadUrl;
      if (!uploadUrl) {
        console.error("Upload URL missing");
        return null;
      }

      const formData = new FormData();
      formData.append("file", file, `${title || "screenshot"}.png`);

      const uploadRes = await axios.post(uploadUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("UPLOAD RESPONSE:", uploadRes.data);
      return uploadRes.data?.payload?.attachment_id || null;
    } catch (err) {
      console.error("Clipboard screenshot error:", err);
      return null;
    }
  };




  const handleClear = () => {
    dispatch(clearCode());
    setStatus("");
  };

  const handleSave = () => {
    if (!user.userid) return setShowLoginModal(true);
    if (!generatedCode) return;
    setShowSaveModal(true);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSiteImage(e.target.files[0]);
    }
  };

  const handleConfirmSave = async () => {
    if (!generatedCode) return;
    if (!siteImage) return alert("Please select an image for your site.");

    try {
      setShowSaveModal(false);

      // Upload the image
      const step1Res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/get/file/url/local`,
        { params: { step: 1 } }
      );
      const uploadUrl = step1Res.data?.payload?.uploadUrl;
      if (!uploadUrl) throw new Error("Upload URL missing");

      const formData = new FormData();
      formData.append("file", siteImage, siteImage.name);

      const uploadRes = await axios.post(uploadUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const attachment_id = uploadRes.data?.payload?.attachment_id;

      // Save site metadata
      const payload = {
        savedSite_reactContent: generatedCode,
        savedSite_ownerId: user.userid,
        savedSite_cumulativeRating: 5,
        savedSite_ratingCount: 1,
        savedSite_title: generatedPage.title || "Untitled Page",
        savedSite_attachmentId: attachment_id,
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/api/crud/saved_site`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      const pagesResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/crud/saved_site`, {
        headers: { "Content-Type": "application/json" },
        params: { id: user.userid },
      });

      dispatch(setUser({ ...user, saved_sites: pagesResponse.data.payload.return }));
    } catch (err) {
      console.error("Failed to save site:", err);
    }
  };

return (
  <div style={{ width: "100%", height: "100%", padding: "40px" }}>
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter a phrase..."
        style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #aaa", outline: "none", flex: 1 }}
        disabled={loading}
      />
      <button type="submit" className="nav-btn" disabled={loading}>{loading ? "Generating..." : "Generate"}</button>
      <button type="button" onClick={handleSave} disabled={!generatedCode}>Save</button>
      <button type="button" onClick={handleClear} disabled={!generatedCode}>Clear</button>
      <button type="button" onClick={handleRandom} disabled={loading}>Random</button>
    </form>

    <div style={{ fontSize: "16px", color: "#ddd", display: "flex", alignItems: "center", gap: "10px" }}>
      {loading && <div style={{ fontSize: "24px", lineHeight: 1 }}>🐱⌛</div>}
      {loading && quirkyMessages[messageIndex]}
    </div>

    {generatedCode ? (
      <div id="page-container">
        <iframe
          title={generatedPage.title || "HTML Preview"}
          srcDoc={generatedCode}
          style={{ marginTop: "20px", width: "100%", height: "600px", border: "1px solid #444", borderRadius: "6px", background: "#fff" }}
        />
      </div>
    ) : (
      <p>No page selected.</p>
    )}

    {/* Login modal */}
    {showLoginModal && (
      <div style={{
        position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999
      }}>
        <div style={{
          backgroundColor: "#1e1e1e", padding: "30px", borderRadius: "12px", color: "#fff",
          textAlign: "center", width: "320px", boxShadow: "0 8px 20px rgba(0,0,0,0.5)"
        }}>
          <h2 style={{ marginBottom: "15px" }}>Login Required</h2>
          <p style={{ marginBottom: "25px" }}>You need to be logged in to save your page.</p>
          <button
            style={{ padding: "10px 20px", borderRadius: "8px", border: "none", backgroundColor: "#4caf50", color: "#fff", cursor: "pointer", marginRight: "10px" }}
            onClick={() => { setShowLoginModal(false); navigate("/profile"); }}
          >
            Login
          </button>
          <button
            style={{ padding: "10px 20px", borderRadius: "8px", border: "none", backgroundColor: "#f44336", color: "#fff", cursor: "pointer" }}
            onClick={() => setShowLoginModal(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    )}

    {/* Save / Upload Image Modal */}
    {showSaveModal && (
      <div style={{
        position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999
      }}>
        <div style={{
          backgroundColor: "#1e1e1e", padding: "30px", borderRadius: "12px", color: "#fff",
          textAlign: "center", width: "320px", boxShadow: "0 8px 20px rgba(0,0,0,0.5)"
        }}>
          <h2 style={{ marginBottom: "15px" }}>Upload Site Image</h2>
          <input 
            type="file" 
            accept="image/*"
            onChange={handleFileChange}
            style={{ marginBottom: "20px" }}
          />
          <div>
            <button
              style={{ padding: "10px 20px", borderRadius: "8px", border: "none", backgroundColor: "#4caf50", color: "#fff", cursor: "pointer", marginRight: "10px" }}
              onClick={handleConfirmSave}
            >
              Save
            </button>
            <button
              style={{ padding: "10px 20px", borderRadius: "8px", border: "none", backgroundColor: "#f44336", color: "#fff", cursor: "pointer" }}
              onClick={() => setShowSaveModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);

}
