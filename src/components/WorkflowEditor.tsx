import React, { useState, useCallback, useRef } from "react";
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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import BaseNode, { BaseNodeData } from "./nodes/BaseNode";
import ActionNode, { ActionNodeData } from "./nodes/ActionNode";
import NodeConfigForm from "./NodeConfigForm";
import NodeLibrary from "./NodeLibrary";
import WorkflowToolbar from "./WorkflowToolbar";
import { getInitialNodes, getInitialEdges } from "@/utils/workflowUtils";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import { executeWorkflow } from "@/utils/workflowExecutionEngine";
import { toast } from "@/components/ui/use-toast";

// Import from Lovable's utility library

// Define a union type for all possible node data types
export type NodeData = BaseNodeData | ActionNodeData;

// Define node types without constraining their generic parameters
const nodeTypes: NodeTypes = {
  baseNode: BaseNode,
  actionNode: ActionNode,
};

// Create an inner component for the workflow editor that uses the ReactFlow hooks
const WorkflowEditorContent: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(getInitialNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(getInitialEdges());
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [configFormOpen, setConfigFormOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const reactFlowInstance = useReactFlow();

  // Set up undo/redo functionality
  const { undo, redo, takeSnapshot, canUndo, canRedo } = useUndoRedo({
    nodes,
    edges,
    onRestore: (state) => {
      setNodes(state.nodes || []);
      setEdges(state.edges || []);
    },
  });

  // Take a snapshot whenever nodes or edges change
  const prevNodesRef = useRef(nodes);
  const prevEdgesRef = useRef(edges);

  React.useEffect(() => {
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

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges],
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    console.log("Node clicked:", node);
  }, []);

  const onNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // Now handled inside the BaseNode component via the dialog
      // We don't need to do anything here anymore
    },
    [],
  );

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

  const handleRunAll = async () => {
    if (isExecuting) return;

    setIsExecuting(true);
    try {
      const results = await executeWorkflow(nodes, edges);
      console.log("Workflow execution results:", results);
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
  };

  const handleAddNode = (nodeType: string, nodeData: NodeData) => {
    // Get position in the middle of the viewport
    const { x, y } = reactFlowInstance.getViewport();
    const position = {
      x: x + Math.random() * 300 + 100,
      y: y + Math.random() * 300 + 100,
    };

    const newNode: Node = {
      id: nodeData.id,
      type: nodeType,
      position,
      data: {
        ...nodeData,
        onConfigUpdate: handleConfigSave,
      },
    };

    setNodes((nds) => [...nds, newNode]);

    toast({
      title: "Node Added",
      description: `Added new ${nodeData.label} node`,
    });
  };

  return (
    <div className="h-full w-full flex flex-col">
      <WorkflowToolbar
        onUndo={undo}
        onRedo={redo}
        onRunWorkflow={handleRunAll}
        canUndo={canUndo}
        canRedo={canRedo}
        isExecuting={isExecuting}
      />

      <div className="flex-1 flex">
        <NodeLibrary onAddNode={handleAddNode} />

        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onNodeDoubleClick={onNodeDoubleClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
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
