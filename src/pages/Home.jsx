import { useState, useEffect } from "react";
import { pexelsClient } from "../helpers/auth";

export default function Home() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [photos, setPhotos] = useState([]);
  const [page, setPage] = useState(1);

  const perPage = 12;

  const searchPhotos = () => {
    if (!submittedQuery) return;

    pexelsClient.photos
      .search({ query: submittedQuery, per_page: perPage, page })
      .then(res => setPhotos(res.photos || []))
      .catch(err => console.error("Pexels fetch error:", err));
  };

  useEffect(() => {
    searchPhotos();
  }, [submittedQuery, page]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSubmittedQuery(query.trim());
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <form
        onSubmit={handleSubmit}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          display: "flex",
          gap: "10px",
          zIndex: 10,
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search phrase..."
          style={{
            padding: "10px 14px",
            borderRadius: "8px",
            border: "1px solid #aaa",
            background: "rgba(255,255,255,0.3)",
            backdropFilter: "blur(6px)",
            color: "#fff",
            outline: "none",
          }}
        />
        <button
          type="submit"
          className="nav-btn"
        >
          Go
        </button>
      </form>

      {/* --- Image Grid --- */}
      <div
        style={{
          marginTop: "100px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "20px",
          padding: "20px",
          width: "100%",
        }}
      >
        {photos.map((photo) => (
          <div
            key={photo.id}
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "1 / 1",          // FORCE 1:1 crop
              overflow: "hidden",
              borderRadius: "12px",
            }}
          >
            <img
              src={photo.src.large}
              alt={photo.alt}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",         // crop to square
                transition: "transform 0.3s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            />

            {/* View Full Button */}
            <a
              href={photo.url}
              target="_blank"
              rel="noreferrer"
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                padding: "5px 8px",
                fontSize: "12px",
                borderRadius: "6px",
                background: "rgba(0,0,0,0.6)",
                color: "#fff",
                opacity: 0,
                transition: "opacity 0.3s",
              }}
              className="view-full-btn"
            >
              View Full
            </a>
          </div>
        ))}
      </div>

      {/* Hover styling via CSS-in-JS */}
      <style>
        {`
          div:hover > .view-full-btn {
            opacity: 1 !important;
          }
        `}
      </style>

      {/* --- Pagination Controls --- */}
      {submittedQuery && (
        <div
          style={{
            position: "sticky",
            bottom: "20px",
            left: 0,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            padding: "10px 0",
            zIndex: 20,
            pointerEvents: "none",  // allow clicks only on children
          }}
        >

          <div style={{ pointerEvents: "auto" }}>
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                opacity: page === 1 ? 0.4 : 1,
              }}
            >
              Prev
            </button>
          </div>

          <div style={{ pointerEvents: "auto" }}>
            <button
              onClick={() => setPage((p) => p + 1)}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Next
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
