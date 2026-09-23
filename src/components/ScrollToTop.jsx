import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * ScrollToTop Component
 * 
 * Global route-level scroll restoration manager mounted inside <BrowserRouter> in App.js.
 * 
 * Architecture & Principles:
 * 1. Single Responsibility: Solves route navigation scroll reset globally without page-specific hacks.
 * 2. Instantaneous: Uses behavior: "instant" to establish the new page context immediately at top (0, 0).
 * 3. Element Reset: Resets window.scrollTo(0, 0) as well as document.documentElement and document.body.
 * 4. Anchor Link Preservation: When a hash is present (e.g. #contact, #events), scrolls to target element.
 * 5. Browser History: Configures window.history.scrollRestoration = "manual" to prevent browser fighting SPA renders.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navType = useNavigationType();

  // Configure manual scroll restoration once on mount
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // Handle route and hash changes
 useEffect(() => {
  if (!hash) {
    window.scrollTo(0, 0);
  } else {
    const targetId = hash.replace("#", "");

    const scrollToAnchor = () => {
      const element = document.getElementById(targetId);

      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    };

    requestAnimationFrame(scrollToAnchor);
  }
}, [pathname, hash, navType]);

  return null;
}
