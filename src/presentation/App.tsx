import { LocaleProvider } from './i18n/LocaleProvider'
import { PortfolioContainer } from './containers/PortfolioContainer'

export function App() {
  return (
    <LocaleProvider>
      <PortfolioContainer />
    </LocaleProvider>
  )
}
