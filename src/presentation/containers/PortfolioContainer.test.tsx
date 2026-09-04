import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { App } from '../App'

/**
 * The safety-floor test.
 *
 * jsdom has no WebGL context, so the quality tier resolves to `static` and no
 * canvas is ever mounted. That is precisely the environment worth asserting
 * against: it is what a crawler, a screen reader, an old phone and a visitor
 * with reduced motion turned on all get. If the whole portfolio is not legible
 * and navigable here, the 3D layer is decorating a broken site.
 */
describe('the portfolio without WebGL', () => {
  beforeEach(() => {
    window.localStorage.clear()
    Object.defineProperty(window.navigator, 'language', { value: 'es-SV', configurable: true })
  })

  it('renders the whole story as semantic sections', async () => {
    render(<App />)

    const main = await screen.findByRole('main')
    const headings = within(main).getAllByRole('heading', { level: 2 })

    expect(headings.length).toBeGreaterThanOrEqual(8)
  })

  it('never mounts a canvas when WebGL is unavailable', async () => {
    const { container } = render(<App />)

    await screen.findByRole('main')

    expect(container.querySelector('canvas')).toBeNull()
  })

  it('leads with the person, at heading level one or two', async () => {
    render(<App />)

    expect(await screen.findByText('Antonio Quintanilla', { selector: 'h2' })).toBeInTheDocument()
  })

  it('exposes every project with a link to its code', async () => {
    render(<App />)
    await screen.findByRole('main')

    const codeLinks = screen.getAllByRole('link', { name: /ver código|view code/i })

    expect(codeLinks.length).toBeGreaterThanOrEqual(4)
    for (const link of codeLinks) {
      expect(link).toHaveAttribute('href', expect.stringContaining('https://github.com/'))
      expect(link).toHaveAttribute('rel', 'noreferrer noopener')
    }
  })

  it('offers a working way to make contact', async () => {
    render(<App />)
    await screen.findByRole('main')

    expect(screen.getByRole('link', { name: /rantonioquin@gmail\.com/ })).toHaveAttribute(
      'href',
      'mailto:rantonioquin@gmail.com',
    )
  })

  it('gives keyboard users a skip link before anything else', async () => {
    render(<App />)
    await screen.findByRole('main')

    const [first] = screen.getAllByRole('link')

    expect(first).toHaveAttribute('href', '#main')
  })

  it('switches language without losing the story', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByRole('main')

    expect(screen.getByText(/Desplazá para recorrer la red/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /cambiar idioma/i }))

    await waitFor(() => {
      expect(screen.getByText(/Scroll to travel the network/)).toBeInTheDocument()
    })

    expect(document.documentElement.lang).toBe('en')
    expect(within(screen.getByRole('main')).getAllByRole('heading', { level: 2 }).length)
      .toBeGreaterThanOrEqual(8)
  })

  it('remembers the chosen language for the next visit', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByRole('main')

    await user.click(screen.getByRole('button', { name: /cambiar idioma/i }))

    await waitFor(() => {
      expect(window.localStorage.getItem('portfolio.locale')).toBe('en')
    })
  })
})
