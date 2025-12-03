/* CatGallery.jsx */
import React from "react";

const CAT_IMAGES = [
  // Random publicly‑available cat pictures (public domain / CC0)
  "https://cdn2.thecatapi.com/images/MTY3MjY4MA.jpg",
  "https://cdn2.thecatapi.com/images/MTU5MDYxNQ.jpg",
  "https://cdn2.thecatapi.com/images/j6cC1qX7aM.jpg",
  "https://cdn2.thecatapi.com/images/S9ZyO2Wl-0.jpg",
  "https://cdn2.thecatapi.com/images/3JfNnF5wYI.jpg",
  "https://cdn2.thecatapi.com/images/4gk8c7QzXc.jpg",
  "https://cdn2.thecatapi.com/images/xTjVZt1bK0.jpg",
  "https://cdn2.thecatapi.com/images/m6sE3wU9xI.jpg",
];

export default function CatGallery() {
  const containerStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "12px",
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
  };

  const cardStyle = {
    position: "relative",
    overflow: "hidden",
    borderRadius: "8px",
    cursor: "pointer",
    boxShadow:
      "rgba(0, 0, 0, 0.15) 0px 4px 12px, rgba(0, 0, 0, 0.10) 0px 2px 6px",
  };

  const imgStyle = {
    width: "100%",
    height: "auto",
    display: "block",
    transition: "transform 0.3s ease",
  };

  const overlayStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(0,0,0,0.6) 100%)",
    opacity: 0,
    transition: "opacity 0.3s ease",
  };

  const cardHoverStyle = {
    transform: "scale(1.02)",
  };

  return (
    <div style={containerStyle}>
      {CAT_IMAGES.map((src, idx) => (
        <div
          key={idx}
          style={cardStyle}
          onMouseEnter={(e) =>
            Object.assign(e.currentTarget.style, cardHoverStyle)
          }
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "";
          }}
        >
          <img src={src} alt="Cute cat" style={imgStyle} />
          <div
            style={{
              ...overlayStyle,
              ...(e?.currentTarget?.matches(":hover")
                ? { opacity: 1 }
                : {}),
            }}
          />
        </div>
      ))}
    </div>
  );
}
