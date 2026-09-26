/** Platzhalter, bis der jeweilige Screen portiert ist. */
export function Placeholder({ label, title }: { label: string; title: string }) {
  return (
    <div data-screen-label={label} style={{ paddingTop: 140, paddingBottom: 80 }}>
      <div
        style={{
          fontFamily: 'var(--ld-font-mono),monospace',
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
        }}
      >
        In Arbeit
      </div>
      <h1 style={{ fontSize: 42, letterSpacing: '-0.03em', margin: '10px 0 0' }}>{title}</h1>
    </div>
  );
}
