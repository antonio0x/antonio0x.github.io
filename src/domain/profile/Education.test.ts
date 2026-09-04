import { describe, expect, it } from 'vitest'
import { DomainError } from '../shared/DomainError'
import { Education } from './Education'
import { Period } from './Period'

describe('Education', () => {
  it('builds a completed programme', () => {
    const education = Education.create({
      id: 'ing-sistemas',
      institution: 'Universidad Gerardo Barrios',
      program: 'Ingeniería en Sistemas y Redes Informáticas',
      period: Period.create('2019', '2025'),
      status: 'completed',
    })

    expect(education.institution).toBe('Universidad Gerardo Barrios')
    expect(education.isOngoing).toBe(false)
  })

  it('builds an ongoing programme', () => {
    const education = Education.create({
      id: 'cloud',
      institution: 'Universidad Gerardo Barrios',
      program: 'Pre-especialización en Servicios y Soluciones en la Nube',
      period: Period.create('2025-08', null),
      status: 'in-progress',
    })

    expect(education.isOngoing).toBe(true)
  })

  it('refuses an in-progress programme that already has an end date', () => {
    expect(() =>
      Education.create({
        id: 'contradiction',
        institution: 'X',
        program: 'Y',
        period: Period.create('2019', '2025'),
        status: 'in-progress',
      }),
    ).toThrow(DomainError)
  })

  it('refuses a completed programme with no end date', () => {
    expect(() =>
      Education.create({
        id: 'contradiction',
        institution: 'X',
        program: 'Y',
        period: Period.create('2019', null),
        status: 'completed',
      }),
    ).toThrow(DomainError)
  })

  it('rejects blank institution or programme', () => {
    const period = Period.create('2019', '2025')

    expect(() =>
      Education.create({ id: 'a', institution: '', program: 'Y', period, status: 'completed' }),
    ).toThrow(DomainError)
    expect(() =>
      Education.create({ id: 'a', institution: 'X', program: ' ', period, status: 'completed' }),
    ).toThrow(DomainError)
  })
})
