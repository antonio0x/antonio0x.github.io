import { describe, expect, it } from 'vitest'
import { DomainError } from '../shared/DomainError'
import { Chapter } from './Chapter'

const validProps = {
  id: 'origin',
  index: 1,
  title: 'Origen',
  body: 'El Salvador. Ingeniería en Sistemas y Redes.',
  focusNodeId: 'origin-root',
}

describe('Chapter', () => {
  it('exposes the props it was built from', () => {
    const chapter = Chapter.create(validProps)

    expect(chapter.id).toBe('origin')
    expect(chapter.index).toBe(1)
    expect(chapter.title).toBe('Origen')
    expect(chapter.focusNodeId).toBe('origin-root')
  })

  it('allows a chapter with no explicit focus node', () => {
    const chapter = Chapter.create({ ...validProps, focusNodeId: null })

    expect(chapter.focusNodeId).toBeNull()
  })

  it('rejects a blank id or title', () => {
    expect(() => Chapter.create({ ...validProps, id: ' ' })).toThrow(DomainError)
    expect(() => Chapter.create({ ...validProps, title: '' })).toThrow(DomainError)
  })

  it('rejects a negative or fractional index', () => {
    expect(() => Chapter.create({ ...validProps, index: -1 })).toThrow(DomainError)
    expect(() => Chapter.create({ ...validProps, index: 1.5 })).toThrow(DomainError)
  })

  it('is frozen', () => {
    expect(Object.isFrozen(Chapter.create(validProps))).toBe(true)
  })
})
