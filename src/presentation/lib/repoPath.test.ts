import { describe, expect, it } from 'vitest'
import { repoPath } from './repoPath'

describe('repoPath', () => {
  it('reduces a GitHub url to the owner and repository', () => {
    expect(repoPath('https://github.com/antonio0x/AT-SV')).toBe('antonio0x/AT-SV')
  })

  it('ignores a trailing slash', () => {
    expect(repoPath('https://github.com/antonio0x/dotfiles/')).toBe('antonio0x/dotfiles')
  })

  it('keeps only the repository, not a path inside it', () => {
    // Deep links exist in the wild; the label should still read as a repo.
    expect(repoPath('https://github.com/antonio0x/AT-SV/tree/main/docs')).toBe('antonio0x/AT-SV')
  })

  it('returns null for a host that is not GitHub', () => {
    // The label claims a GitHub repository. Printing "owner/repo" for a GitLab
    // url would be a small lie rendered in monospace.
    expect(repoPath('https://gitlab.com/antonio0x/thing')).toBeNull()
  })

  it('returns null for a GitHub url that names no repository', () => {
    expect(repoPath('https://github.com/antonio0x')).toBeNull()
    expect(repoPath('https://github.com')).toBeNull()
  })

  it('returns null rather than throwing on a malformed url', () => {
    expect(repoPath('not a url')).toBeNull()
    expect(repoPath('')).toBeNull()
  })
})
