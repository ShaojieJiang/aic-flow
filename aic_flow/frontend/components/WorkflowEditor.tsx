import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  NodeTypes,
  useReactFlow,
  ReactFlowProvider,
  Panel,
  Edge,
  BackgroundVariant,
  OnSelectionChangeParams,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useParams } from "react-router-dom";

import BaseNode, { BaseNodeData } from "./nodes/BaseNode";
import ActionNode, { ActionNodeData } from "./nodes/ActionNode";
import NodeConfigForm from "./NodeConfigForm";
import NodeLibrary from "./NodeLibrary";
import WorkflowToolbar from "./WorkflowToolbar";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import { executeWorkflow } from "@/utils/workflowExecutionEngine";
import { toast } from "@/components/ui/use-toast";
import { createNodeFromDefinition } from "@/utils/nodeFactory";
import { ALL_NODE_TYPES } from "@/nodes/types";
import { Button } from "@/components/ui/button";

// Define a union type for all possible node data types
export type NodeData = BaseNodeData | ActionNodeData;

// Define node types without constraining their generic parameters
const nodeTypes: NodeTypes = {
  baseNode: BaseNode,
  actionNode: ActionNode,
};

// Create an inner component for the workflow editor that uses the ReactFlow hooks
const WorkflowEditorContent: React.FC = () => {
  const { id: workflowId } = useParams<{ id: string }>();
  const [workflowName, setWorkflowName] = useState<string>("Untitled Workflow");
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [configFormOpen, setConfigFormOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedElements, setSelectedElements] =
    useState<OnSelectionChangeParams>({
      nodes: [],
      edges: [],
    });
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Extract workflow name from the URL parameter
  useEffect(() => {
    if (workflowId) {
      // Format the workflow name from the URL parameter
      const formattedName = workflowId
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      setWorkflowName(formattedName);
    }
  }, [workflowId]);

  // Set up undo/redo functionality
  const { undo, redo, takeSnapshot, canUndo, canRedo } = useUndoRedo({
    nodes,
    edges,
    onRestore: (state) => {
      setNodes(state.nodes || []);
      setEdges(state.edges || []);
    },
  });

  // Run workflow handler
  const handleRunAll = useCallback(async () => {
    if (isExecuting) return;

    setIsExecuting(true);
    try {
      const results = await executeWorkflow(nodes, edges);
      console.log("Workflow execution results:", results);

      toast({
        title: "Workflow Completed",
        description: "Workflow execution finished successfully",
      });
    } catch (error) {
      console.error("Workflow execution error:", error);
      toast({
        title: "Workflow Error",
        description: `Error executing workflow: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  }, [isExecuting, nodes, edges]);

  // Set up keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle keyboard shortcuts
      if (event.ctrlKey && event.key === "z") {
        event.preventDefault();
        undo();
      } else if (event.ctrlKey && event.key === "y") {
        event.preventDefault();
        redo();
      } else if (event.ctrlKey && event.key === "Enter") {
        event.preventDefault();
        handleRunAll();
      } else if (
        (event.key === "Delete" || event.key === "Backspace") &&
        selectedElements.nodes.length > 0
      ) {
        // Only handle delete if we're not in an input field
        if (
          !(
            event.target instanceof HTMLInputElement ||
            event.target instanceof HTMLTextAreaElement
          )
        ) {
          event.preventDefault();
          setNodes((nds) =>
            nds.filter(
              (node) => !selectedElements.nodes.find((n) => n.id === node.id),
            ),
          );
          setEdges((eds) =>
            eds.filter(
              (edge) => !selectedElements.edges.find((e) => e.id === edge.id),
            ),
          );
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedElements, undo, redo, handleRunAll, setNodes, setEdges]);

  // Take a snapshot whenever nodes or edges change
  const prevNodesRef = useRef(nodes);
  const prevEdgesRef = useRef(edges);

  useEffect(() => {
    // Only take a snapshot if something actually changed
    if (
      JSON.stringify(prevNodesRef.current) !== JSON.stringify(nodes) ||
      JSON.stringify(prevEdgesRef.current) !== JSON.stringify(edges)
    ) {
      takeSnapshot();
      prevNodesRef.current = nodes;
      prevEdgesRef.current = edges;
    }
  }, [nodes, edges, takeSnapshot]);

  // Connection handler
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: "#7a8999" },
          },
          eds,
        ),
      );

      toast({
        title: "Connection Created",
        description: "Nodes connected successfully",
      });
    },
    [setEdges],
  );

  // Selection change handler
  const onSelectionChange = useCallback((params: OnSelectionChangeParams) => {
    setSelectedElements(params);
  }, []);

  // Node click handler
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    console.log("Node clicked:", node);
  }, []);

  // Node double click handler
  const onNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // We're using the handler inside the BaseNode component
    },
    [],
  );

  // Edge click handler
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    console.log("Edge clicked:", edge);
  }, []);

  // Config save handler
  const handleConfigSave = (nodeId: string, config: Record<string, any>) => {
    setNodes((nds) => {
      return nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...(node.data as NodeData),
              config: {
                ...(node.data as NodeData).config,
                ...config,
              },
              // If label is updated in config, update the node label as well
              label: config.label || (node.data as NodeData).label,
            },
          };
        }
        return node;
      });
    });

    toast({
      title: "Configuration Saved",
      description: `Updated configuration for node ${nodeId}`,
    });
  };

  // Add node handler
  const handleAddNode = (newNode: Node) => {
    // Get position in the center of the viewport
    if (reactFlowWrapper.current) {
      const rect = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.screenToFlowPosition({
        x: rect.width / 2,
        y: rect.height / 2,
      });

      // Add a small random offset to avoid nodes stacking
      newNode.position = {
        x: position.x + Math.random() * 100 - 50,
        y: position.y + Math.random() * 100 - 50,
      };

      // Add config update handler
      newNode.data = {
        ...newNode.data,
        onConfigUpdate: handleConfigSave,
      };

      setNodes((nds) => [...nds, newNode]);

      toast({
        title: "Node Added",
        description: `Added new ${newNode.data.label} node`,
      });
    }
  };

  // Create demo workflow
  const createDemoWorkflow = () => {
    if (nodes.length > 0) {
      if (
        !window.confirm("This will replace your current workflow. Continue?")
      ) {
        return;
      }
    }

    // Create demo nodes
    const httpNode = createNodeFromDefinition(
      ALL_NODE_TYPES.find((n) => n.id === "rest-get")!,
      { x: 100, y: 100 },
      "http-1",
    );

    const transformNode = createNodeFromDefinition(
      ALL_NODE_TYPES.find((n) => n.id === "transform")!,
      { x: 400, y: 100 },
      "transform-1",
    );

    const ifElseNode = createNodeFromDefinition(
      ALL_NODE_TYPES.find((n) => n.id === "if-else")!,
      { x: 700, y: 100 },
      "if-else-1",
    );

    const notificationNode = createNodeFromDefinition(
      ALL_NODE_TYPES.find((n) => n.id === "notification")!,
      { x: 1000, y: 50 },
      "notification-1",
    );

    const fileExportNode = createNodeFromDefinition(
      ALL_NODE_TYPES.find((n) => n.id === "file-export")!,
      { x: 1000, y: 200 },
      "file-export-1",
    );

    // Add config update handler to all nodes
    httpNode.data = {
      ...httpNode.data,
      onConfigUpdate: handleConfigSave,
    };

    transformNode.data = {
      ...transformNode.data,
      onConfigUpdate: handleConfigSave,
    };

    ifElseNode.data = {
      ...ifElseNode.data,
      onConfigUpdate: handleConfigSave,
    };

    notificationNode.data = {
      ...notificationNode.data,
      onConfigUpdate: handleConfigSave,
    };

    fileExportNode.data = {
      ...fileExportNode.data,
      onConfigUpdate: handleConfigSave,
    };

    // Create demo edges
    const demoEdges: Edge[] = [
      {
        id: "edge-http-transform",
        source: "http-1",
        target: "transform-1",
        animated: true,
        style: { stroke: "#7a8999" },
      },
      {
        id: "edge-transform-ifelse",
        source: "transform-1",
        target: "if-else-1",
        animated: true,
        style: { stroke: "#7a8999" },
      },
      {
        id: "edge-ifelse-notification",
        source: "if-else-1",
        sourceHandle: "true",
        target: "notification-1",
        animated: true,
        label: "If true",
        style: { stroke: "#7a8999" },
      },
      {
        id: "edge-ifelse-export",
        source: "if-else-1",
        sourceHandle: "false",
        target: "file-export-1",
        animated: true,
        label: "If false",
        style: { stroke: "#7a8999" },
      },
    ];

    setNodes([
      httpNode,
      transformNode,
      ifElseNode,
      notificationNode,
      fileExportNode,
    ]);
    setEdges(demoEdges);

    // Fit view to the new workflow
    setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.2 });

      toast({
        title: "Demo Workflow Created",
        description: "A sample workflow has been created for you",
      });
    }, 100);
  };

  // Save workflow handler (just a mock for now)
  const handleSaveWorkflow = () => {
    toast({
      title: "Workflow Saved",
      description: "Your workflow has been saved",
    });
  };

  // Export workflow handler
  const handleExportWorkflow = () => {
    if (nodes.length === 0) {
      toast({
        title: "Nothing to Export",
        description: "Create a workflow first before exporting",
        variant: "destructive",
      });
      return;
    }

    const flowData = {
      nodes,
      edges,
      viewport: reactFlowInstance.getViewport(),
    };

    const dataStr = JSON.stringify(flowData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileName = "workflow-export.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileName);
    linkElement.click();

    toast({
      title: "Workflow Exported",
      description: "Your workflow has been exported as JSON",
    });
  };

  // Import workflow handler
  const handleImportWorkflow = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;

      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
          try {
            const result = e.target?.result as string;
            const flowData = JSON.parse(result);

            if (flowData.nodes && flowData.edges) {
              // Add config update handler to all imported nodes
              const importedNodes = flowData.nodes.map((node: Node) => ({
                ...node,
                data: {
                  ...node.data,
                  onConfigUpdate: handleConfigSave,
                },
              }));

              setNodes(importedNodes);
              setEdges(flowData.edges);

              if (flowData.viewport) {
                reactFlowInstance.setViewport(flowData.viewport);
              }

              toast({
                title: "Workflow Imported",
                description: "Workflow has been imported successfully",
              });
            } else {
              throw new Error("Invalid workflow file format");
            }
          } catch (error) {
            console.error("Import error:", error);
            toast({
              title: "Import Error",
              description: "Failed to import workflow. Invalid format.",
              variant: "destructive",
            });
          }
        };

        reader.readAsText(file);
      }
    };

    input.click();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Delete" && selectedElements?.nodes.length) {
        setNodes((nds) =>
          nds.filter((n) => !selectedElements.nodes.includes(n)),
        );
        setEdges((eds) =>
          eds.filter(
            (e) =>
              !selectedElements.nodes.includes(e.source) &&
              !selectedElements.nodes.includes(e.target),
          ),
        );
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedElements, setNodes, setEdges]);

  return (
    <div ref={reactFlowWrapper} className="h-full w-full flex flex-col">
      <WorkflowToolbar
        onUndo={undo}
        onRedo={redo}
        onRunWorkflow={handleRunAll}
        onSaveWorkflow={handleSaveWorkflow}
        onExportWorkflow={handleExportWorkflow}
        onImportWorkflow={handleImportWorkflow}
        onNewWorkflow={createDemoWorkflow}
        canUndo={canUndo}
        canRedo={canRedo}
        isExecuting={isExecuting}
        workflowName={workflowName}
      />

      <div className="flex-1 flex overflow-hidden">
        <NodeLibrary onAddNode={handleAddNode} />

        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onNodeDoubleClick={onNodeDoubleClick}
            onEdgeClick={onEdgeClick}
            nodeTypes={nodeTypes}
            onSelectionChange={onSelectionChange}
            fitView
            deleteKeyCode={null} // Disable default delete to use our custom handler
            className="bg-background"
            snapToGrid
            snapGrid={[15, 15]}
          >
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            <Controls />
            <MiniMap zoomable pannable />

            <Panel
              position="top-right"
              className="bg-background/80 p-2 rounded-sm text-xs"
            >
              {selectedElements.nodes.length > 0 && (
                <div>
                  Selected: {selectedElements.nodes.length} nodes,{" "}
                  {selectedElements.edges.length} edges
                </div>
              )}
            </Panel>

            {nodes.length === 0 && (
              <Panel position="top-center" className="text-center">
                <div className="bg-card p-4 rounded-md shadow-sm">
                  <h3 className="text-lg font-medium mb-2">
                    Welcome to AIC Flow
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Get started by adding nodes from the library on the left.
                  </p>
                  <Button onClick={createDemoWorkflow}>
                    Create Demo Workflow
                  </Button>
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>
      </div>

      {/* We keep this for compatibility, but it's no longer used for configuration */}
      <NodeConfigForm
        isOpen={configFormOpen}
        onClose={() => setConfigFormOpen(false)}
        node={selectedNode}
        onSave={handleConfigSave}
      />
    </div>
  );
};

// Main wrapper component that provides the ReactFlow context
const WorkflowEditor: React.FC = () => {
  return (
    <ReactFlowProvider>
      <WorkflowEditorContent />
    </ReactFlowProvider>
  );
};

export default WorkflowEditor;
