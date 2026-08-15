/**
 * hooks/usePageTitle.js
 *
 * Sets document.title for the current page and restores the previous
 * title when the component unmounts (or the value changes).
 *
 * @param {string} title — page title; defaults to the MovieDex brand title.
 */
import { useEffect } from 'react';

const DEFAULT_TITLE = 'MovieDex — Discover Movies & TV Shows';

export default function usePageTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title || DEFAULT_TITLE;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
