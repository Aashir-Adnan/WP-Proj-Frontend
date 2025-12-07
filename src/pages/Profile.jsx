import { useEffect, useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setUser, clearUser } from "../helpers/user/userSlice";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../helpers/user/firebaseAuth";
import axios from "axios";

export default function Profile() {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [editingName, setEditingName] = useState(false);
  const [editableName, setEditableName] = useState("");

  const handleCredentialResponse = useCallback(async (response) => {
    const decoded = parseJwt(response.credential);
    if (!decoded) return;

    const token = response.credential;
    const backend_response = await sendToBackend(token);

    dispatch(
      setUser({
        email: decoded.email,
        name: decoded.name,
        photoURL: decoded.picture,
        token,
        userid: backend_response.payload.return.insertId
      })
    );

    setEditableName(decoded.name);
    
  }, [dispatch]);

  useEffect(() => {
    if (!user.email && window.google) {
      google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      google.accounts.id.renderButton(
        document.getElementById("google-login-button"),
        { theme: "outline", size: "large" }
      );
    }
  }, [user.email, handleCredentialResponse]);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const FUser = result.user;

      console.log("Firebase User Picture:", FUser.photoURL);
      const token = await FUser.getIdToken();
      const backend_response = await sendToBackend(token);
      const pagesResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/crud/saved_site`, {
        headers: { "Content-Type": "application/json" },
        params: { id: backend_response.payload.return.insertId }
      });

      dispatch(
        setUser({
          email: FUser.email,
          name: FUser.displayName,
          token,
          photoURL: FUser.photoURL,
          userid: backend_response.payload.return.insertId,
          saved_sites: pagesResponse.data.payload.return
        })
      );

      setEditableName(FUser.displayName);
    } catch (err) {
      console.error("Popup Login Failed:", err);
    }
  };

  const sendToBackend = async (token) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ext/sign/up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signUp_flag: "Firebase",
          idToken: token,
        }),
      });
      const data = await res.json();
      console.log("Backend reply:", data);
      return data
    } catch (err) {
      console.error("Backend error:", err);
    }
  };

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  };

  const handleLogout = () => dispatch(clearUser());

  return (
    <div style={{ padding: 40, color: "#fff" }}>
      <h1>Your Profile</h1>

      {!user.email ? (
        <>

          <button
            style={{
              marginTop: 20,
              padding: "10px 20px",
              borderRadius: 8,
            }}
            onClick={loginWithGoogle}
          >
            Login with Gmail
          </button>
        </>
      ) : (
        <div>

          {user.photoURL && (
            <img
              src={user.photoURL}
              alt="profile"
              style={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                marginBottom: 20,
              }}
            />
          )}

          <p>Email: {user.email}</p>

          <div style={{ marginBottom: 15, display: "flex", alignItems: "center" }}>
            <label>Username:</label>

            {!editingName ? (
              <>
                <span style={{ marginLeft: 10 }}>{editableName}</span>

                <span
                  style={{
                    marginLeft: 10,
                    cursor: "pointer",
                    opacity: 0.8,
                    fontSize: 14,
                  }}
                  onClick={() => setEditingName(true)}
                >
                  ✎
                </span>
              </>
            ) : (
              <input
                style={{
                  marginLeft: 10,
                  padding: "5px",
                  borderRadius: 6,
                  border: "1px solid #888",
                }}
                value={editableName}
                onChange={(e) => setEditableName(e.target.value)}
                onBlur={() => setEditingName(false)}
              />
            )}
          </div>

          <button
            onClick={handleLogout}
            style={{
              marginTop: 20,
              padding: "10px 20px",
              borderRadius: 8,
              background: "#f44336",
              color: "#fff",
              border: 0,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
