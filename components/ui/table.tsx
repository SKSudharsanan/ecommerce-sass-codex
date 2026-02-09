export function Table({ children }: { children: React.ReactNode }) {
  return <table className="ui-table">{children}</table>;
}

export function Th({ children }: { children: React.ReactNode }) {
  return <th>{children}</th>;
}

export function Td({ children }: { children: React.ReactNode }) {
  return <td>{children}</td>;
}
