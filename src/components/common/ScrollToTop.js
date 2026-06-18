import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const timer = window.setTimeout(() => {
      const scrollOptions = {
        behavior: "smooth",
        block: "start",
      };

      if (hash) {
        const target = document.getElementById(hash.slice(1));
        if (target) {
          target.scrollIntoView(scrollOptions);
          return;
        }
      }

      const scroller = document.scrollingElement || document.documentElement;
      scroller.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });

      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }, 80);

    return () => window.clearTimeout(timer);
  }, [pathname, search, hash]);

  return null;
};

export default ScrollToTop;
