export function Eyebrow({ children }: { children: string }) {
  if (children.length === 0) return null

  return <p className="eyebrow mb-3">{children}</p>
}
