import React from "react";
import {
  Undo2,
  Redo2,
  Play,
  Loader2,
  Save,
  Download,
  Upload,
  Plus,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShortcutsDialog } from "@/components/shortcuts-dialog";

interface WorkflowToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  onRunWorkflow: () => void;
  onSaveWorkflow?: () => void;
  onImportWorkflow?: () => void;
  onExportWorkflow?: () => void;
  onNewWorkflow?: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isExecuting?: boolean;
  workflowName?: string;
  showVersionMenu?: boolean;
}

const WorkflowToolbar: React.FC<WorkflowToolbarProps> = ({
  onUndo,
  onRedo,
  onRunWorkflow,
  onSaveWorkflow,
  onImportWorkflow,
  onExportWorkflow,
  onNewWorkflow,
  canUndo,
  canRedo,
  isExecuting = false,
  workflowName = "Untitled Workflow",
  showVersionMenu = false,
}) => {
  return (
    <div className="border-b p-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-2" />

        <Button
          variant="outline"
          size="sm"
          onClick={onRunWorkflow}
          disabled={isExecuting}
          className="flex items-center gap-1"
        >
          {isExecuting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Run Workflow
            </>
          )}
        </Button>

        <Separator orientation="vertical" className="h-6 mx-2" />

        <Button
          variant="outline"
          size="icon"
          onClick={onNewWorkflow}
          title="New Workflow"
        >
          <Plus className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onSaveWorkflow}
          title="Save Workflow (Ctrl+S)"
        >
          <Save className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex gap-1">
              <span className="hidden sm:inline">Import/Export</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={onImportWorkflow}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportWorkflow}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center">
          <FileText className="h-4 w-4 mr-1 text-muted-foreground" />
          <h2 className="text-sm font-medium">{workflowName}</h2>
        </div>
        <ShortcutsDialog />
      </div>
    </div>
  );
};

export default WorkflowToolbar;
