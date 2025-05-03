import { Node, Edge } from "@xyflow/react";
import { executeLangGraphWorkflow } from "./langGraphExecutor";
import { toast } from "@/components/ui/use-toast";
import { NodeData } from "@/components/WorkflowEditor";

/**
 * Topological sort to determine execution order
 */
const getExecutionOrder = (nodes: Node[], edges: Edge[]): Node[] => {
  const nodeMap = new Map<string, Node>();
  const inDegree = new Map<string, number>();
  const queue: Node[] = [];
  const result: Node[] = [];

  // Initialize data structures
  nodes.forEach((node) => {
    nodeMap.set(node.id, node);
    inDegree.set(node.id, 0);
  });

  // Calculate in-degrees
  edges.forEach((edge) => {
    const targetId = edge.target;
    inDegree.set(targetId, (inDegree.get(targetId) || 0) + 1);
  });

  // Find nodes with no incoming edges
  nodes.forEach((node) => {
    if ((inDegree.get(node.id) || 0) === 0) {
      queue.push(node);
    }
  });

  // Process nodes in topological order
  while (queue.length > 0) {
    const currentNode = queue.shift()!;
    result.push(currentNode);

    // Find outgoing edges and decrement in-degree of targets
    edges.forEach((edge) => {
      if (edge.source === currentNode.id) {
        const targetId = edge.target;
        const newInDegree = (inDegree.get(targetId) || 0) - 1;
        inDegree.set(targetId, newInDegree);

        if (newInDegree === 0) {
          const targetNode = nodeMap.get(targetId);
          if (targetNode) {
            queue.push(targetNode);
          }
        }
      }
    });
  }

  // Check for cycles
  if (result.length !== nodes.length) {
    console.warn("Workflow contains cycles and cannot be fully executed");
  }

  return result;
};

/**
 * Get node input values from connected nodes
 */
const getNodeInputs = (
  node: Node,
  edges: Edge[],
  nodeOutputs: Map<string, any>,
): Record<string, any> => {
  let inputValues: Record<string, any> = {};

  // Find all incoming edges to this node
  const incomingEdges = edges.filter((edge) => edge.target === node.id);

  for (const edge of incomingEdges) {
    // Get the source node's output value
    const sourceNodeId = edge.source;
    const sourceNodeOutputs = nodeOutputs.get(sourceNodeId);

    if (sourceNodeOutputs) {
      // With simplified handles, we can just use the direct output
      inputValues = sourceNodeOutputs;
    }
  }

  return inputValues;
};

/**
 * Execute the workflow
 */
export const executeWorkflow = async (
  nodes: Node[],
  edges: Edge[],
): Promise<Map<string, any>> => {
  // Use LangGraph execution as the primary execution method
  try {
    return await executeLangGraphWorkflow(nodes, edges);
  } catch (error) {
    console.warn(
      "LangGraph execution failed, falling back to legacy execution",
      error,
    );
    // Fall back to the original execution method
    return executeWorkflowLegacy(nodes, edges);
  }
};

/**
 * Legacy workflow execution method
 */
const executeWorkflowLegacy = async (
  nodes: Node[],
  edges: Edge[],
): Promise<Map<string, any>> => {
  const executionOrder = getExecutionOrder(nodes, edges);
  const nodeOutputs = new Map<string, any>();

  toast({
    title: "Workflow Execution",
    description: "Starting workflow execution...",
  });

  console.log(
    "Execution order:",
    executionOrder.map((n) => n.id),
  );

  for (const node of executionOrder) {
    try {
      const nodeData = node.data as NodeData;
      console.log(`Executing node ${node.id} (${nodeData.label})...`);

      // Get inputs from connected nodes
      const inputs = getNodeInputs(node, edges, nodeOutputs);
      console.log(`Node ${node.id} inputs:`, inputs);

      // Execute the node
      if (nodeData.onRun) {
        const outputs = await nodeData.onRun(node.id, inputs, nodeData.config);

        // Store the outputs for use by downstream nodes
        nodeOutputs.set(node.id, outputs);
        console.log(`Node ${node.id} outputs:`, outputs);

        // Record execution history (keeping only the latest)
        nodeData.executionHistory = [
          {
            timestamp: new Date().toISOString(),
            inputs,
            outputs,
          },
        ];
      }
    } catch (error) {
      console.error(`Error executing node ${node.id}:`, error);
      toast({
        title: "Execution Error",
        description: `Error in node ${node.id}: ${(error as Error).message}`,
        variant: "destructive",
      });
      break;
    }
  }

  toast({
    title: "Workflow Completed",
    description: "Workflow execution finished",
  });

  return nodeOutputs;
};
