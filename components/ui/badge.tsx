export function Badge({ tone = 'default', children }: { tone?: 'default' | 'success' | 'warning' | 'danger'; children: React.ReactNode }) {
  return <span className={`ui-badge ui-badge-${tone}`}>{children}</span>;
}
