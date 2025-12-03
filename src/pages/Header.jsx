import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Title from "./Title";
import "../index.css";

export default function Header() {
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const pages = ["Page 1", "Page 2", "Page 3"]; // temporary API data

  const spawnIconRain = (e) => {
    const btn = e.currentTarget;
    const icons = ["✨", "🔥", "💎", "⭐", "🌟", "⚡"]; // icons for rain

    for (let i = 0; i < 20; i++) {
      const spark = document.createElement("div");
      spark.className = "glitter";
      spark.textContent = icons[Math.floor(Math.random() * icons.length)];

      const size = 16 + Math.random() * 12; // emoji size
      spark.style.fontSize = `${size}px`;
      spark.style.position = "absolute";
      spark.style.pointerEvents = "none";

      const startX = Math.random() * btn.offsetWidth;
      spark.style.left = `${startX}px`;
      spark.style.top = `0px`;

      const duration = 800 + Math.random() * 400;

      spark.animate(
        [
          { transform: "translateY(0) rotate(0deg)", opacity: 1 },
          { transform: `translateY(${80 + Math.random() * 50}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
        ],
        { duration, easing: "ease-out", fill: "forwards" }
      );

      btn.appendChild(spark);
      setTimeout(() => spark.remove(), duration);
    }
  };



  return (
    <header className="header">
      <Title />
      <div className="header-nav">
        <Link
          to="/"
          className={`nav-btn animate-float ${location.pathname === "/" ? "current" : ""}`}
          onClick={spawnIconRain}
        >
          Home
        </Link>
        <Link
          to="/blog"
          className={`nav-btn animate-float ${location.pathname === "/blog" ? "current" : ""}`}
          onClick={spawnIconRain}
        >
          Blog
        </Link>
        <Link
          to="/profile"
          className={`nav-btn animate-float ${location.pathname === "/profile" ? "current" : ""}`}
          onClick={spawnIconRain}
        >
          Profile
        </Link>

        <div className="nav-dropdown animate-float">
          <button
            className="nav-btn dropdown-toggle"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            Your Pages <span className={`arrow ${dropdownOpen ? "open" : ""}`}>▼</span>
          </button>

          {dropdownOpen && (
            <div className="dropdown-content">
              {pages.map((p, i) => (
                <div key={i} className="dropdown-item">{p}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
