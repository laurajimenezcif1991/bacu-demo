/**
 * Resolves a public asset path relative to Vite's BASE_URL.
 * Works correctly in both local dev (base="/") and GitHub Pages (base="/bacu-demo/").
 */
export const assetUrl = (path: string): string =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
