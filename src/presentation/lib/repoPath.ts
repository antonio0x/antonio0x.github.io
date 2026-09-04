const GITHUB_HOSTS = new Set(['github.com', 'www.github.com'])

/**
 * Reduces a GitHub repository url to the `owner/repo` a developer recognises.
 *
 * This is here so a project card can show what it actually links to. The full
 * url is noise in a card, and "View code" alone hides the one detail another
 * engineer scans for.
 *
 * Returns null instead of a best guess for anything that is not a GitHub
 * repository: a malformed url, a different host, or a profile page with no
 * repository in it. A wrong `owner/repo` rendered in monospace reads as fact.
 */
export function repoPath(url: string): string | null {
  let parsed: URL

  try {
    parsed = new URL(url)
  } catch {
    return null
  }

  if (!GITHUB_HOSTS.has(parsed.hostname)) return null

  const [owner, repo] = parsed.pathname.split('/').filter((segment) => segment.length > 0)
  if (owner === undefined || repo === undefined) return null

  return `${owner}/${repo}`
}
