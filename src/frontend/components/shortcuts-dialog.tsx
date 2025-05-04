import React from "react";
import { Command } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ShortcutsDialog() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1"
        onClick={() => setOpen(true)}
      >
        <Command className="h-3 w-3" />
        <span className="hidden sm:inline">Shortcuts</span>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
            <DialogDescription>
              All available keyboard shortcuts for the workflow editor
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px]">
            <KeyboardShortcuts />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

function KeyboardShortcuts() {
  const shortcuts = [
    {
      category: "General",
      items: [
        { key: "Ctrl + S", description: "Save workflow" },
        { key: "Ctrl + Z", description: "Undo" },
        { key: "Ctrl + Y", description: "Redo" },
        { key: "Ctrl + Space", description: "Run workflow" },
        { key: "?", description: "Show keyboard shortcuts" },
      ],
    },
    {
      category: "Navigation",
      items: [
        { key: "Arrow keys", description: "Move selected node" },
        { key: "Ctrl + F", description: "Search nodes" },
        { key: "Tab", description: "Select next node" },
        { key: "Shift + Tab", description: "Select previous node" },
        { key: "Space", description: "Pan canvas" },
        { key: "Scroll", description: "Zoom in/out" },
        { key: "Alt + Scroll", description: "Pan horizontally" },
        { key: "Shift + Scroll", description: "Pan vertically" },
      ],
    },
    {
      category: "Editing",
      items: [
        { key: "Delete", description: "Delete selected elements" },
        { key: "Ctrl + A", description: "Select all nodes" },
        { key: "Ctrl + D", description: "Duplicate selected nodes" },
        { key: "Ctrl + G", description: "Group selected nodes" },
        { key: "Ctrl + U", description: "Ungroup selected" },
        { key: "Ctrl + C", description: "Copy selected" },
        { key: "Ctrl + V", description: "Paste" },
        { key: "Ctrl + X", description: "Cut selected" },
        { key: "Escape", description: "Cancel current action" },
        { key: "F2", description: "Rename selected node" },
        { key: "Enter", description: "Edit selected node" },
      ],
    },
    {
      category: "View",
      items: [
        { key: "Ctrl + +", description: "Zoom in" },
        { key: "Ctrl + -", description: "Zoom out" },
        { key: "Ctrl + 0", description: "Reset zoom" },
        { key: "Ctrl + 1", description: "Fit view to visible elements" },
        { key: "F", description: "Fit view to selection" },
        { key: "M", description: "Toggle minimap" },
        { key: "L", description: "Toggle node library" },
      ],
    },
  ];

  return (
    <div className="grid gap-5">
      <style>{`
        .shortcuts-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }
        .shortcuts-table tr:not(:last-child) td {
          border-bottom: 1px solid var(--border);
        }
        .shortcuts-table td {
          padding: 8px 0;
        }
        .shortcuts-table td:first-child {
          width: 40%;
        }
      `}</style>

      {shortcuts.map((category) => (
        <div key={category.category}>
          <h3 className="text-sm font-medium mb-2">{category.category}</h3>
          <div className="rounded-md border">
            <table className="shortcuts-table">
              <tbody>
                {category.items.map((item) => (
                  <tr key={item.key}>
                    <td className="px-4">
                      <kbd className="px-2 py-0.5 text-xs bg-muted rounded font-mono">
                        {item.key}
                      </kbd>
                    </td>
                    <td className="px-4 text-sm">{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
