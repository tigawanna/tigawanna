/**
 * Replaces the current history entry with the same path and search but no hash.
 * Does not trigger navigation or scroll.
 */
export function replaceUrlWithoutHash(pathname: string, searchStr: string) {
  if (!window.location.hash) {
    return;
  }

  const nextUrl = `${pathname}${searchStr}`;
  window.history.replaceState(window.history.state, "", nextUrl);
}
