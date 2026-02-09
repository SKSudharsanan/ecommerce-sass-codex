import { Button } from '@/components/ui/button';

export function Dialog({ title, open, onClose, children }: { title: string; open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;

  return (
    <div className="ui-dialog-backdrop" role="presentation" onClick={onClose}>
      <div className="ui-dialog" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="ui-dialog-header">
          <h3>{title}</h3>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
