import { Node, Edge } from "@xyflow/react";
import { toast } from "sonner";

/**
 * Executes a workflow by connecting to the backend service
 *
 * @param nodes Array of workflow nodes
 * @param edges Array of workflow edges
 * @returns Promise resolving to the workflow execution result
 */
export const executeWorkflow = async (nodes: Node[], edges: Edge[]) => {
  try {
    // Convert workflow to backend format
    const workflowConfig = convertToBackendFormat(nodes, edges);
    console.log("Workflow config for backend:", workflowConfig);

    // Initialize workflow connection
    const workflowId = "test-1"; // In a real implementation, this would be dynamic
    const socket = new WebSocket(
      `ws://localhost:8000/ws/workflow/${workflowId}`,
    );

    return new Promise((resolve, reject) => {
      // Set up socket event handlers
      socket.onopen = () => {
        console.log("WebSocket connection established");
        // Send workflow configuration
        socket.send(
          JSON.stringify({
            type: "run_workflow",
            graph_config: workflowConfig,
            inputs: {
              messages: [{ type: "human", content: "Execute workflow" }],
              system_prompt: "Workflow execution system",
            },
          }),
        );
      };

      socket.onmessage = (event) => {
        const response = JSON.parse(event.data);
        console.log("Received workflow state update:", response);

        // Update node states based on response
        if (response.node_id) {
          // Here we would update node state in the UI
          console.log(
            `Node ${response.node_id} executed with result:`,
            response.result,
          );
        }

        // Handle workflow completion
        if (response.status === "completed") {
          console.log("Workflow execution completed");
          socket.close();
          resolve(response);
        } else if (response.status === "error") {
          console.error("Workflow execution error:", response.error);
          socket.close();
          reject(new Error(response.error));
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        reject(new Error("WebSocket connection error"));
      };

      socket.onclose = () => {
        console.log("WebSocket connection closed");
      };
    });
  } catch (error) {
    console.error("Error executing workflow:", error);
    toast.error("Failed to execute workflow");
    throw error;
  }
};

/**
 * Converts the React Flow nodes and edges to the backend workflow format
 *
 * @param nodes Array of workflow nodes
 * @param edges Array of workflow edges
 * @returns Backend-compatible workflow configuration
 */
const convertToBackendFormat = (nodes: Node[], edges: Edge[]) => {
  // Find START and END nodes
  const startNode = nodes.find((node) => node.data.label === "START");
  const endNode = nodes.find((node) => node.data.label === "END");

  if (!startNode || !endNode) {
    throw new Error("Workflow must contain both START and END nodes");
  }

  // Convert nodes to backend format
  const backendNodes = nodes.map((node) => {
    // Special handling for START and END nodes
    if (node.data.label === "START") {
      return { name: node.id, type: "START" };
    }

    if (node.data.label === "END") {
      return { name: node.id, type: "END" };
    }

    // Regular nodes
    const nodeConfig: Record<string, any> = {
      name: node.id,
      type: node.data.actionType || "PythonCode", // Default to PythonCode if not specified
    };

    // Add node configuration
    if (node.data.config) {
      // Add relevant config properties based on the node type
      if (
        node.data.actionType === "PythonCode" ||
        node.data.actionType === "transform"
      ) {
        const config = node.data.config as Record<string, any>;
        nodeConfig.code = config.function || config.code || "return {}";
      } else if (node.data.actionType === "rest-get") {
        const config = node.data.config as Record<string, any>;
        nodeConfig.url = config.url || "";
        nodeConfig.method = config.method || "GET";
      }
    }

    return nodeConfig;
  });

  // Convert edges to backend format - just source and target node IDs
  const backendEdges = edges.map((edge) => [edge.source, edge.target]);

  return {
    nodes: backendNodes,
    edges: backendEdges,
  };
};
