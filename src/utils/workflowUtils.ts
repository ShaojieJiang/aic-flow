import { Node, Edge } from "@xyflow/react";
import { NodeData } from "@/components/WorkflowEditor";

// Node type definitions
export const nodeTypes = {
  base: "baseNode",
  action: "actionNode",
};

// Initial workflow setup
export const getInitialNodes = (): Node[] => [
  {
    id: "1",
    type: "actionNode",
    position: { x: 250, y: 100 },
    data: {
      id: "1",
      label: "HTTP Request",
      actionType: "http",
      inputs: {
        url: { type: "string" },
      },
      outputs: {
        response: { type: "object" },
        status: { type: "number" },
      },
      config: {
        url: "https://api.example.com/data",
        method: "GET",
      },
      onRun: async (
        nodeId: string,
        inputs: Record<string, any>,
        config: Record<string, any>,
      ) => {
        console.log(`Running HTTP Request node ${nodeId}`);
        // Simulate HTTP request
        const outputs = {
          response: {
            data: { message: "Success!" },
            status: 200,
          },
        };
        return outputs;
      },
    },
  },
  {
    id: "2",
    type: "actionNode",
    position: { x: 250, y: 250 },
    data: {
      id: "2",
      label: "Process Data",
      actionType: "function",
      inputs: {
        data: { type: "object" },
      },
      outputs: {
        result: { type: "string" },
      },
      config: {
        function: "return inputs.data.message.toUpperCase();",
      },
      onRun: async (
        nodeId: string,
        inputs: Record<string, any>,
        config: Record<string, any>,
      ) => {
        console.log(`Running Process Data node ${nodeId}`);
        // Simulate data processing
        try {
          // This would be replaced with proper function execution
          const result = inputs.data?.message
            ? inputs.data.message.toUpperCase()
            : "NO INPUT";
          return { result };
        } catch (error) {
          console.error("Error processing data:", error);
          return { error: "Processing failed" };
        }
      },
    },
  },
];

export const getInitialEdges = (): Edge[] => [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    sourceHandle: "output-response",
    targetHandle: "input-data",
    animated: true,
  },
];

// Function to update node data
export const updateNodeConfig = (
  nodes: Node[],
  nodeId: string,
  config: Record<string, any>,
): Node[] => {
  return nodes.map((node) => {
    if (node.id === nodeId) {
      // Update the node config
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
};
