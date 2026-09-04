import { describe, expect, it } from 'vitest'
import { DomainError } from '../shared/DomainError'
import { SetupItem } from './SetupItem'

const valid = {
  id: 'neovim',
  name: 'Neovim',
  category: 'editor' as const,
  note: 'Configured from scratch on top of LazyVim.',
  url: 'https://neovim.io',
}

describe('SetupItem', () => {
  it('keeps what it was given', () => {
    const item = SetupItem.create(valid)

    expect(item.id).toBe('neovim')
    expect(item.name).toBe('Neovim')
    expect(item.category).toBe('editor')
    expect(item.url).toBe('https://neovim.io')
  })

  it('accepts a piece with nowhere to link to', () => {
    expect(SetupItem.create({ ...valid, url: null }).url).toBeNull()
  })

  it('rejects a blank id, name or note', () => {
    expect(() => SetupItem.create({ ...valid, id: ' ' })).toThrow(DomainError)
    expect(() => SetupItem.create({ ...valid, name: '' })).toThrow(DomainError)
    expect(() => SetupItem.create({ ...valid, note: '  ' })).toThrow(DomainError)
  })

  it('rejects a link that is not http(s)', () => {
    // Same rule the contact channels hold: a link that will not open is a
    // build failure, not a broken anchor the visitor discovers.
    expect(() => SetupItem.create({ ...valid, url: 'javascript:alert(1)' })).toThrow(DomainError)
    expect(() => SetupItem.create({ ...valid, url: 'neovim.io' })).toThrow(DomainError)
  })

  it('orders items by the layer of the system they sit in', () => {
    // The list should read from the machine outwards, not alphabetically:
    // distro, then shell, then the tools running inside it.
    const distro = SetupItem.create({ ...valid, id: 'arch', category: 'distro' })
    const editor = SetupItem.create(valid)
    const theme = SetupItem.create({ ...valid, id: 'theme', category: 'theme' })

    expect(SetupItem.byLayer(distro, editor)).toBeLessThan(0)
    expect(SetupItem.byLayer(theme, distro)).toBeGreaterThan(0)
  })
})
