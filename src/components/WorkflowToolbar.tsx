import React from "react";
import { Undo2, Redo2, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkflowToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  onRunWorkflow: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isExecuting?: boolean;
}

const WorkflowToolbar: React.FC<WorkflowToolbarProps> = ({
  onUndo,
  onRedo,
  onRunWorkflow,
  canUndo,
  canRedo,
  isExecuting = false,
}) => {
  return (
    <div className="border-b p-2 flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo"
      >
        <Undo2 className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo"
      >
        <Redo2 className="h-4 w-4" />
      </Button>

      <div className="border-l h-6 mx-2" />

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
    </div>
  );
};

export default WorkflowToolbar;
