import { useLocale } from '../../i18n/useLocale'

export function SiteFooter({ fullName }: { fullName: string }) {
  const { t } = useLocale()

  return (
    <footer className="border-t border-line px-6 py-10 sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {fullName}
        </p>
        <p>{t.footerNote}</p>
      </div>
    </footer>
  )
}
