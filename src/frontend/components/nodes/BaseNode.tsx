import React, { useState, useCallback } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import * as Icons from "lucide-react";
import { Play, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NodeCategory } from "@/nodes/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Define BaseNodeData with correct typing
export interface BaseNodeData extends Record<string, unknown> {
  id: string;
  label: string;
  description?: string;
  category?: NodeCategory;
  icon?: string;
  emoji?: string; // Add emoji property
  inputs: Record<string, { type: string; [key: string]: any }>;
  outputs: Record<string, { type: string; [key: string]: any }>;
  config: Record<string, any>;
  executionHistory?: Array<{
    timestamp: string;
    inputs: Record<string, any>;
    outputs: Record<string, any>;
  }>;
  onRun?: (
    nodeId: string,
    inputs: Record<string, any>,
    config: Record<string, any>,
  ) => Promise<Record<string, any>>;
  onConfigUpdate?: (nodeId: string, config: Record<string, any>) => void;
}

// Helper to get icon component
const getIconComponent = (iconName: string): React.ReactNode => {
  // Default to Settings if icon name doesn't exist
  const IconComponent = (Icons as any)[iconName] || Icons.Settings;
  return <IconComponent className="h-4 w-4" />;
};

const BaseNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [config, setConfig] = useState<Record<string, any>>({});
  const nodeData = data as BaseNodeData;

  // Initialize execution history if it doesn't exist
  if (!nodeData.executionHistory) {
    nodeData.executionHistory = [];
  }

  // Initialize config state from node data
  React.useEffect(() => {
    setConfig(nodeData.config || {});
  }, [nodeData.config]);

  const handleRun = useCallback(async () => {
    if (!nodeData.onRun || isRunning) return;

    setIsRunning(true);
    try {
      const inputs = nodeData.inputs;
      const outputs = await nodeData.onRun(id, inputs, nodeData.config);
      console.log(`Node ${id} outputs:`, outputs);

      // Record execution history (keep only the latest)
      nodeData.executionHistory = [
        {
          timestamp: new Date().toISOString(),
          inputs,
          outputs,
        },
        ...(nodeData.executionHistory || []).slice(0, 9), // Keep last 10 runs
      ];
    } catch (error) {
      console.error(`Error running node ${id}:`, error);
    } finally {
      setIsRunning(false);
    }
  }, [id, nodeData, isRunning]);

  const handleDoubleClick = useCallback(() => {
    setShowDialog(true);
  }, []);

  const handleConfigSave = useCallback(() => {
    if (nodeData.onConfigUpdate) {
      nodeData.onConfigUpdate(id, config);
    }
    setShowDialog(false);
  }, [id, config, nodeData]);

  const latestHistory =
    nodeData.executionHistory && nodeData.executionHistory.length > 0
      ? nodeData.executionHistory[0]
      : null;

  // Get appropriate styling based on node category
  const getCategoryColor = () => {
    if (!nodeData.category) return "";

    switch (nodeData.category) {
      case NodeCategory.SOURCE:
        return "bg-green-50 dark:bg-green-900/20";
      case NodeCategory.SINK:
        return "bg-red-50 dark:bg-red-900/20";
      case NodeCategory.PROCESSING:
        return "bg-blue-50 dark:bg-blue-900/20";
      case NodeCategory.CONTROL_FLOW:
        return "bg-amber-50 dark:bg-amber-900/20";
      case NodeCategory.INTEGRATION:
        return "bg-purple-50 dark:bg-purple-900/20";
      case NodeCategory.CUSTOM:
        return "bg-gray-50 dark:bg-gray-900/20";
      case NodeCategory.SPECIAL:
        return "bg-slate-50 dark:bg-slate-900/20";
      default:
        return "";
    }
  };

  // Get badge for node category
  const getCategoryBadge = () => {
    if (!nodeData.category) return null;

    const categoryColors: Record<string, string> = {
      [NodeCategory.SOURCE]:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      [NodeCategory.SINK]:
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
      [NodeCategory.PROCESSING]:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
      [NodeCategory.CONTROL_FLOW]:
        "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
      [NodeCategory.INTEGRATION]:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
      [NodeCategory.CUSTOM]:
        "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100",
      [NodeCategory.SPECIAL]:
        "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-100",
    };

    return (
      <Badge
        variant="outline"
        className={`${categoryColors[nodeData.category]} text-xs`}
      >
        {nodeData.category}
      </Badge>
    );
  };

  // Check if this is a START or END node for special styling
  const isSpecialNode = nodeData.label === "START" || nodeData.label === "END";

  // Count input and output handles
  const inputCount = Object.keys(nodeData.inputs || {}).length;
  const outputCount = Object.keys(nodeData.outputs || {}).length;

  return (
    <>
      <div
        className={`px-4 py-3 rounded-md border ${getCategoryColor()} min-w-[180px] ${
          selected ? "border-primary ring-1 ring-primary" : "border-border"
        } ${isSpecialNode ? "font-bold" : ""}`}
        onDoubleClick={handleDoubleClick}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {nodeData.emoji && (
              <div className="flex items-center justify-center text-xl">
                {nodeData.emoji}
              </div>
            )}
            <div
              className={`${isSpecialNode ? "font-bold" : "font-medium"} text-sm`}
            >
              {nodeData.label}
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={handleRun}
            disabled={isRunning || isSpecialNode}
          >
            <Play className={`h-3 w-3 ${isRunning ? "animate-pulse" : ""}`} />
          </Button>
        </div>

        <div className="flex items-center justify-between">
          {!isSpecialNode && getCategoryBadge()}

          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 ml-auto"
            onClick={handleDoubleClick}
          >
            <Settings className="h-3 w-3" />
          </Button>
        </div>

        {/* Input handles */}
        {inputCount === 0 && nodeData.label !== "START" ? (
          <Handle
            type="target"
            position={Position.Left}
            className="w-2 h-2 rounded-full"
            style={{ top: 30 }}
          />
        ) : (
          Object.keys(nodeData.inputs || {}).map((inputKey, index) => (
            <Handle
              key={`input-${inputKey}`}
              id={`input-${inputKey}`}
              type="target"
              position={Position.Left}
              className="w-2 h-2 rounded-full"
              style={{ top: 30 + index * 15 }}
            />
          ))
        )}

        {/* Output handles */}
        {outputCount === 0 && nodeData.label !== "END" ? (
          <Handle
            type="source"
            position={Position.Right}
            className="w-2 h-2 rounded-full"
            style={{ top: 30 }}
          />
        ) : (
          Object.keys(nodeData.outputs || {}).map((outputKey, index) => (
            <Handle
              key={`output-${outputKey}`}
              id={`output-${outputKey}`}
              type="source"
              position={Position.Right}
              className="w-2 h-2 rounded-full"
              style={{ top: 30 + index * 15 }}
            />
          ))
        )}
      </div>

      {/* Node Configuration and History Dialog with side-by-side panels */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-[98vw] max-h-[90vh] overflow-x-auto overflow-y-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {nodeData.emoji && <span>{nodeData.emoji}</span>}
              {nodeData.label}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-[1fr_2fr_1fr] gap-4 h-[80vh] min-w-[900px]">
            {/* Input Panel */}
            <div className="border rounded-md p-4 h-[80vh] overflow-auto">
              <h3 className="font-medium mb-3">Input</h3>
              <ScrollArea className="h-[calc(80vh-3rem)]">
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Input Ports</h4>
                  {Object.keys(nodeData.inputs || {}).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(nodeData.inputs || {}).map(
                        ([key, value]) => (
                          <div key={key} className="flex items-start">
                            <div className="bg-muted p-2 rounded">
                              <div className="font-mono text-xs">{key}</div>
                              <div className="text-xs text-muted-foreground">
                                {value.type}
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      This node has no input ports.
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">
                    Last Execution Input
                  </h4>
                  {latestHistory ? (
                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                      {JSON.stringify(latestHistory.inputs, null, 2)}
                    </pre>
                  ) : (
                    <div className="text-center text-muted-foreground py-4">
                      No execution history available
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Config Panel */}
            <div className="border rounded-md p-4 h-[80vh] overflow-auto">
              <h3 className="font-medium mb-3">Configuration</h3>
              <ScrollArea className="h-[calc(80vh-3rem)]">
                <div className="grid gap-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="node-label" className="text-right">
                      Label
                    </Label>
                    <Input
                      id="node-label"
                      value={config.label || nodeData.label}
                      onChange={(e) =>
                        setConfig({ ...config, label: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>

                  {/* Node description if available */}
                  {nodeData.description && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="node-description" className="text-right">
                        Description
                      </Label>
                      <div className="col-span-3 text-sm text-muted-foreground">
                        {nodeData.description}
                      </div>
                    </div>
                  )}

                  {/* Action node specific fields - HTTP */}
                  {"actionType" in nodeData &&
                    nodeData.actionType === "rest-get" && (
                      <>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="url" className="text-right">
                            URL
                          </Label>
                          <Input
                            id="url"
                            value={config.url || ""}
                            onChange={(e) =>
                              setConfig({ ...config, url: e.target.value })
                            }
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="method" className="text-right">
                            Method
                          </Label>
                          <Input
                            id="method"
                            value={config.method || "GET"}
                            onChange={(e) =>
                              setConfig({ ...config, method: e.target.value })
                            }
                            className="col-span-3"
                          />
                        </div>
                      </>
                    )}

                  {/* Action node specific fields - Function */}
                  {"actionType" in nodeData &&
                    (nodeData.actionType === "PythonCode" ||
                      nodeData.actionType === "transform" ||
                      nodeData.actionType === "function") && (
                      <>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="function" className="text-right">
                            Code
                          </Label>
                          <Textarea
                            id="function"
                            value={config.function || config.code || ""}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                function: e.target.value,
                                code: e.target.value,
                              })
                            }
                            className="col-span-3 font-mono"
                            rows={10}
                          />
                        </div>
                      </>
                    )}

                  {/* If-Else node fields */}
                  {"actionType" in nodeData &&
                    nodeData.actionType === "if-else" && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="expression" className="text-right">
                          Condition
                        </Label>
                        <Input
                          id="expression"
                          value={config.expression || ""}
                          onChange={(e) =>
                            setConfig({ ...config, expression: e.target.value })
                          }
                          placeholder="e.g. value > 0"
                          className="col-span-3"
                        />
                      </div>
                    )}

                  {/* Generic config field for any other properties */}
                  {Object.entries(config).map(([key, value]) => {
                    // Skip fields we've already handled
                    if (
                      [
                        "label",
                        "url",
                        "method",
                        "function",
                        "code",
                        "expression",
                      ].includes(key)
                    ) {
                      return null;
                    }

                    // Skip functions or complex objects
                    if (
                      typeof value === "function" ||
                      (typeof value === "object" && value !== null)
                    ) {
                      return null;
                    }

                    return (
                      <div
                        key={key}
                        className="grid grid-cols-4 items-center gap-4"
                      >
                        <Label
                          htmlFor={`config-${key}`}
                          className="text-right capitalize"
                        >
                          {key}
                        </Label>
                        <Input
                          id={`config-${key}`}
                          value={value}
                          onChange={(e) =>
                            setConfig({ ...config, [key]: e.target.value })
                          }
                          className="col-span-3"
                        />
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
              <div className="mt-4 flex justify-end">
                <Button onClick={handleConfigSave}>Save</Button>
              </div>
            </div>

            {/* Output Panel */}
            <div className="border rounded-md p-4 h-[80vh] overflow-auto">
              <h3 className="font-medium mb-3">Output</h3>
              <ScrollArea className="h-[calc(80vh-3rem)]">
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Output Ports</h4>
                  {Object.keys(nodeData.outputs || {}).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(nodeData.outputs || {}).map(
                        ([key, value]) => (
                          <div key={key} className="flex items-start">
                            <div className="bg-muted p-2 rounded">
                              <div className="font-mono text-xs">{key}</div>
                              <div className="text-xs text-muted-foreground">
                                {value.type}
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      This node has no output ports.
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">
                    Last Execution Output
                  </h4>
                  {latestHistory ? (
                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                      {JSON.stringify(latestHistory.outputs, null, 2)}
                    </pre>
                  ) : (
                    <div className="text-center text-muted-foreground py-4">
                      No execution history available
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BaseNode;
