import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ShortcutsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Keyboard Shortcuts
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to work more efficiently.
          </DialogDescription>
        </DialogHeader>

        <div className="shortcuts-drawer">
          <div className="shortcuts-section">
            <h3>Canvas Navigation</h3>
            <div className="shortcut-row">
              <span>Pan canvas</span>
              <div className="shortcut-keys">
                <span className="shortcut-key">Space</span>
                <span>+</span>
                <span className="shortcut-key">Drag</span>
              </div>
            </div>
            <div className="shortcut-row">
              <span>Zoom in/out</span>
              <div className="shortcut-keys">
                <span className="shortcut-key">Scroll</span>
                <span>or</span>
                <span className="shortcut-key">Ctrl</span>
                <span>+</span>
                <span className="shortcut-key">+/-</span>
              </div>
            </div>
            <div className="shortcut-row">
              <span>Fit view</span>
              <div className="shortcut-keys">
                <span className="shortcut-key">Ctrl</span>
                <span>+</span>
                <span className="shortcut-key">F</span>
              </div>
            </div>
          </div>

          <div className="shortcuts-section">
            <h3>Node Operations</h3>
            <div className="shortcut-row">
              <span>Select node</span>
              <div className="shortcut-keys">
                <span className="shortcut-key">Click</span>
              </div>
            </div>
            <div className="shortcut-row">
              <span>Select multiple</span>
              <div className="shortcut-keys">
                <span className="shortcut-key">Shift</span>
                <span>+</span>
                <span className="shortcut-key">Click</span>
              </div>
            </div>
            <div className="shortcut-row">
              <span>Delete selected</span>
              <div className="shortcut-keys">
                <span className="shortcut-key">Delete</span>
                <span>or</span>
                <span className="shortcut-key">Backspace</span>
              </div>
            </div>
            <div className="shortcut-row">
              <span>Copy selected</span>
              <div className="shortcut-keys">
                <span className="shortcut-key">Ctrl</span>
                <span>+</span>
                <span className="shortcut-key">C</span>
              </div>
            </div>
            <div className="shortcut-row">
              <span>Paste nodes</span>
              <div className="shortcut-keys">
                <span className="shortcut-key">Ctrl</span>
                <span>+</span>
                <span className="shortcut-key">V</span>
              </div>
            </div>
          </div>

          <div className="shortcuts-section">
            <h3>Workflow Actions</h3>
            <div className="shortcut-row">
              <span>Undo</span>
              <div className="shortcut-keys">
                <span className="shortcut-key">Ctrl</span>
                <span>+</span>
                <span className="shortcut-key">Z</span>
              </div>
            </div>
            <div className="shortcut-row">
              <span>Redo</span>
              <div className="shortcut-keys">
                <span className="shortcut-key">Ctrl</span>
                <span>+</span>
                <span className="shortcut-key">Y</span>
              </div>
            </div>
            <div className="shortcut-row">
              <span>Run workflow</span>
              <div className="shortcut-keys">
                <span className="shortcut-key">Ctrl</span>
                <span>+</span>
                <span className="shortcut-key">Enter</span>
              </div>
            </div>
            <div className="shortcut-row">
              <span>Save workflow</span>
              <div className="shortcut-keys">
                <span className="shortcut-key">Ctrl</span>
                <span>+</span>
                <span className="shortcut-key">S</span>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .shortcuts-section {
            margin-bottom: 1.5rem;
          }
          .shortcuts-section h3 {
            font-weight: 600;
            margin-bottom: 0.75rem;
            font-size: 1rem;
          }
          .shortcut-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
          }
          .shortcut-keys {
            display: flex;
            align-items: center;
            gap: 0.25rem;
          }
          .shortcut-key {
            background-color: hsl(var(--muted));
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-family: monospace;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
