import { useLocation } from "react-router-dom";

export default function Footer() {
  const { pathname } = useLocation();
  const hide = pathname === "/" || pathname === "/blog" || pathname === "/profile";

  if (hide) return null;

  return (
    <footer className="footer">
      <button className="btn">Share This Page!</button>
    </footer>
  );
}
