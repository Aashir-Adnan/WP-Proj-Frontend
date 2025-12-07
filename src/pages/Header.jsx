import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Title from "./Title";
import { setCode } from "../helpers/code/genCodeSlice"; 
import "../index.css";

export default function Header() {
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const pages = user.saved_sites || [];
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handlePageClick = (page) => {
    dispatch(setCode({
      title: page.savedSite_pageName,
      code: page.savedSite_reactContent
    }));
    setDropdownOpen(false);
  };

  return (
    <header className="header">
      <Title />
      <div className="header-nav">
        <Link to="/" className={`nav-btn animate-float ${location.pathname === "/" ? "current" : ""}`}>Home</Link>
        <Link to="/blog" className={`nav-btn animate-float ${location.pathname === "/blog" ? "current" : ""}`}>Blog</Link>
        <Link to="/profile" className={`nav-btn animate-float ${location.pathname === "/profile" ? "current" : ""}`}>
          {user.photoURL ? <img src={user.photoURL} alt="profile" style={{ width: 40, height: 40, borderRadius: "50%" }} /> : "Profile"}
        </Link>

        <div className="nav-dropdown animate-float">
          <button className="nav-btn dropdown-toggle" onClick={() => setDropdownOpen(!dropdownOpen)}>
            Your Pages <span className={`arrow ${dropdownOpen ? "open" : ""}`}>▼</span>
          </button>

          {dropdownOpen && (
            <div className="dropdown-content">
              {pages.map((p) => (
                <div key={p.savedSite_id} className="dropdown-item" onClick={() => handlePageClick(p)}>
                  {p.savedSite_pageName}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
