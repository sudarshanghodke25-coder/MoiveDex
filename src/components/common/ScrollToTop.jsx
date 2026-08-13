import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop — resets the page scroll to the top on every route change.
 *
 * Without this, React Router keeps the previous page's scroll position when
 * navigating (e.g. clicking a movie poster at the bottom of /home opens the
 * detail page scrolled to the bottom), and the browser's own scroll
 * restoration can fight the new page.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    // Instant jump — never 'smooth', otherwise the browser animates the new
    // page from the previous scroll position (the "opens from the bottom" bug).
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
