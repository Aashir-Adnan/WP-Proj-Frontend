import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setCode } from "../helpers/code/genCodeSlice";
import { useNavigate } from "react-router-dom";

export default function Blog() {

  const user = useSelector((state) => state.user);

  const [sites, setSites] = useState([]);
  const [pageName, setPageName] = useState("");
  const [username, setUsername] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [ratings, setRatings] = useState({});
  const [userRatings, setUserRatings] = useState({}); // { siteId: true/false }

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch sites
  const fetchSites = async () => {
    try {
      const filterColumns = [];
      const filterValues = [];
      const filterConditions = [];

      if (pageName.trim()) {
        filterColumns.push("saved_site.page_name");
        filterValues.push('%' + pageName.trim() + '%');
        filterConditions.push("LIKE");
      }

      if (username.trim()) {
        filterColumns.push("users.username");
        filterValues.push('%' + username.trim() + '%');
        filterConditions.push("LIKE");
      }

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/crud/saved_site`, {
        params: {
          page_no: 1,
          page_size: 50,
          sort_by: "savedSite_cumulativeRating",
          sort_order: "DESC",
          filter_columns_and: JSON.stringify(filterColumns),
          filter_values_and: encodeURIComponent(JSON.stringify(filterValues)),
          filter_conditions_and: JSON.stringify(filterConditions),
        },
      });

      const fetchedSites = res.data.payload?.return || [];
      setSites(fetchedSites);

      if (user?.userid) {
        const ratingsStatus = {};
        await Promise.all(
          fetchedSites.map(async (s) => {
            try {
              const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/crud/rating/logs`, {
                params: { site_id: s.savedSite_id, user_id: user.userid }
              });
              ratingsStatus[s.savedSite_id] = res.data?.exists || false;
            } catch (err) {
              console.error(err);
              ratingsStatus[s.savedSite_id] = false;
            }
          })
        );
        setUserRatings(ratingsStatus);
      }
    } catch (err) {
      console.error("Failed to load sites", err);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const tryPage = (content, title) => {
    dispatch(setCode({ title, code: content }));
    navigate("/");
  };

  const handleSelectRating = (siteId, value) => {
    setRatings(prev => ({ ...prev, [siteId]: value }));
  };

  const handleSubmitRating = async (site) => {
    const ratingValue = ratings[site.savedSite_id];
    if (!ratingValue) return;

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/crud/rating/logs`, {
        site_id: site.savedSite_id,
        user_id: user.userid
      });

      const newCount = (site.savedSite_ratingCount || 0) + 1;
      const newCumulative = (site.savedSite_cumulativeRating || 0) + ratingValue;

      await axios.put(`${import.meta.env.VITE_API_URL}/api/crud/saved_site`, {
        id: site.savedSite_id,
        savedSite_reactContent: site.savedSite_reactContent,
        savedSite_cumulativeRating: newCumulative,
        savedSite_ratingCount: newCount
      });

      setSites(prev => prev.map(s => s.savedSite_id === site.savedSite_id
        ? { ...s, savedSite_cumulativeRating: newCumulative, savedSite_ratingCount: newCount }
        : s
      ));

      setRatings(prev => ({ ...prev, [site.savedSite_id]: 0 }));
      setUserRatings(prev => ({ ...prev, [site.savedSite_id]: true }));
    } catch (err) {
      console.error("Failed to submit rating", err);
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: "20px", color: "white" }}>Saved Sites</h1>

      <div className="search-row">
        <input
          type="text"
          placeholder="Filter by Page Name"
          value={pageName}
          onChange={e => setPageName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <button onClick={fetchSites}>Search</button>
      </div>

      <div className="site-grid">
        {sites.length === 0 ? <p>No results.</p> : sites.map((s) => {
          const isOpen = expanded === s.savedSite_id;
          const selectedRating = ratings[s.savedSite_id] || 0;
          const userRated = userRatings[s.savedSite_id] || false;
          const avgRating = s.savedSite_ratingCount ? Math.round(s.savedSite_cumulativeRating / s.savedSite_ratingCount) : 0;

          return (
            <div
              key={s.savedSite_id}
              className={`site-card ${isOpen ? "expanded" : ""}`}
              onClick={() => setExpanded(isOpen ? null : s.savedSite_id)}
              style={{
                position: "relative",
                backgroundImage: `url(${import.meta.env.VITE_API_URL}/api/get/file?step=1&attachmentId=${s.savedSite_attachmentId}&_=${Date.now()}})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                padding: "10px",
                borderRadius: "12px",
                color: "#fff"
              }}
            >
              <p style={{
                display: "inline-block",
                padding: "4px 12px",
                background: "rgba(0,0,0,0.3)",
                borderRadius: "20px",
                border: "1px solid rgba(255,255,255,0.3)"
              }}>{s.savedSite_pageName}</p>

              <p style={{
                display: "inline-block",
                padding: "4px 12px",
                marginLeft: "8px",
                background: "rgba(0,0,0,0.3)",
                borderRadius: "20px",
                border: "1px solid rgba(255,255,255,0.3)"
              }}>
                NYA POWER: <br></br>{"😺".repeat(avgRating)}
              </p>

              {isOpen && (
                <div className="expanded-content" style={{ marginTop: "10px" }}>
                  <p>By: {s.users_username}</p>
                  <button
                    className="try-btn"
                    onClick={e => {
                      e.stopPropagation();
                      tryPage(s.savedSite_reactContent, s.savedSite_pageName);
                    }}
                  >
                    Try The Page
                  </button>

                  {(!userRated && user?.userid) && (
                    <div style={{ marginTop: "8px" }}>
                      {[1, 2, 3, 4, 5].map(val => (
                        <span
                          key={val}
                          style={{
                            cursor: "pointer",
                            fontSize: "24px",
                            opacity: selectedRating >= val ? 1 : 0.4
                          }}
                          onClick={(e) => {
                            e.stopPropagation();   // <--- Prevent card toggle
                            handleSelectRating(s.savedSite_id, val);
                          }}
                        >
                          😺
                        </span>
                      ))}
                      <button
                        style={{ marginLeft: "10px" }}
                        onClick={(e) => {
                          e.stopPropagation();   // <--- Prevent card toggle
                          handleSubmitRating(s);
                        }}
                      >
                        Submit
                      </button>
                    </div>

                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
