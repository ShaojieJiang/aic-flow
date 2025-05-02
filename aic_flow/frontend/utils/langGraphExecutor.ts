import { Node, Edge } from "@xyflow/react";
import * as workflowExecutionEngine from "./workflowExecutionEngine";
import { toast } from "@/components/ui/use-toast";
import { NodeData } from "@/components/WorkflowEditor";

/**
 * Executes a workflow using LangGraph principles
 */
export const executeLangGraphWorkflow = async (
  nodes: Node[],
  edges: Edge[],
): Promise<Map<string, any>> => {
  const nodeOutputs = new Map<string, any>();

  toast({
    title: "LangGraph Execution",
    description: "Starting workflow execution with LangGraph...",
  });

  try {
    // Group nodes by their connections to create execution branches
    const branches = identifyBranches(nodes, edges);

    // Process each branch as a sequence
    for (const branch of branches) {
      await executeBranch(branch, nodes, edges, nodeOutputs);
    }

    toast({
      title: "Workflow Completed",
      description: "LangGraph workflow execution finished successfully",
    });

    return nodeOutputs;
  } catch (error) {
    console.error("LangGraph workflow execution error:", error);
    toast({
      title: "Execution Error",
      description: `Error in LangGraph execution: ${(error as Error).message}`,
      variant: "destructive",
    });
    throw error;
  }
};

/**
 * Group nodes into execution branches
 */
const identifyBranches = (nodes: Node[], edges: Edge[]): Node[][] => {
  // Find source nodes (nodes with no incoming edges)
  const sourceNodeIds = new Set(nodes.map((node) => node.id));
  edges.forEach((edge) => {
    sourceNodeIds.delete(edge.target);
  });

  // For each source, trace the execution path
  const branches: Node[][] = [];
  sourceNodeIds.forEach((sourceId) => {
    const branch = traceExecutionPath(sourceId, nodes, edges);
    if (branch.length > 0) {
      branches.push(branch);
    }
  });

  return branches;
};

/**
 * Trace the execution path from a source node
 */
const traceExecutionPath = (
  sourceId: string,
  nodes: Node[],
  edges: Edge[],
): Node[] => {
  const branch: Node[] = [];
  const visited = new Set<string>();

  const traverse = (nodeId: string) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      branch.push(node);

      // Find outgoing edges
      const outgoingEdges = edges.filter((e) => e.source === nodeId);
      outgoingEdges.forEach((edge) => {
        traverse(edge.target);
      });
    }
  };

  traverse(sourceId);
  return branch;
};

/**
 * Execute a branch of nodes
 */
const executeBranch = async (
  branch: Node[],
  allNodes: Node[],
  allEdges: Edge[],
  nodeOutputs: Map<string, any>,
) => {
  // Identify parallel execution points
  const executionGroups = identifyExecutionGroups(branch, allEdges);

  // Execute each group in sequence
  for (const group of executionGroups) {
    if (group.length === 1) {
      // Single node execution
      const node = group[0];
      const nodeData = node.data as NodeData;
      const nodeRunner = createNodeRunner(
        node,
        nodeData,
        allNodes,
        allEdges,
        nodeOutputs,
      );
      await nodeRunner({});
    } else {
      // Parallel node execution
      await executeParallel(group, allNodes, allEdges, nodeOutputs, {});
    }
  }
};

/**
 * Identify groups of nodes that can be executed in parallel or sequentially
 */
const identifyExecutionGroups = (branch: Node[], edges: Edge[]): Node[][] => {
  // For simplicity, we'll return each node as its own execution group for sequential execution
  // In a more advanced implementation, this would identify parallel execution opportunities
  return branch.map((node) => [node]);
};

/**
 * Create a runnable function for a node
 */
const createNodeRunner = (
  node: Node,
  nodeData: NodeData,
  allNodes: Node[],
  allEdges: Edge[],
  nodeOutputs: Map<string, any>,
) => {
  return async (input: any) => {
    console.log(`Executing node ${node.id} (${nodeData.label})...`);

    // Get inputs from connected nodes or from the sequence input
    const nodeInputs = getNodeInputs(node, allEdges, nodeOutputs, input);

    try {
      // Execute the node
      let output;
      if (nodeData.onRun) {
        output = await nodeData.onRun(node.id, nodeInputs, nodeData.config);
      } else {
        output = { result: "Default output" };
      }

      // Store the output
      nodeOutputs.set(node.id, output);

      // Store execution history
      nodeData.executionHistory = [
        {
          timestamp: new Date().toISOString(),
          inputs: nodeInputs,
          outputs: output,
        },
        ...(nodeData.executionHistory || []).slice(0, 9),
      ];

      console.log(`Node ${node.id} output:`, output);
      return output;
    } catch (error) {
      console.error(`Error executing node ${node.id}:`, error);
      throw error;
    }
  };
};

/**
 * Get inputs for a node from its connected nodes
 */
const getNodeInputs = (
  node: Node,
  edges: Edge[],
  nodeOutputs: Map<string, any>,
  sequenceInput: any,
): Record<string, any> => {
  let inputs: Record<string, any> = {};

  // Get inputs from connected nodes
  const incomingEdges = edges.filter((edge) => edge.target === node.id);

  if (incomingEdges.length === 0) {
    // For source nodes, use the sequence input
    inputs = sequenceInput || {};
  } else {
    // For other nodes, get inputs from connected nodes
    incomingEdges.forEach((edge) => {
      const sourceOutput = nodeOutputs.get(edge.source);
      if (sourceOutput) {
        inputs = { ...inputs, ...sourceOutput };
      }
    });
  }

  return inputs;
};

/**
 * Execute nodes in parallel
 */
const executeParallel = async (
  parallelNodes: Node[],
  allNodes: Node[],
  allEdges: Edge[],
  nodeOutputs: Map<string, any>,
  input: any,
): Promise<Record<string, any>> => {
  try {
    // Create an array of promises for parallel execution
    const promises = parallelNodes.map((node) => {
      const nodeData = node.data as NodeData;
      const nodeRunner = createNodeRunner(
        node,
        nodeData,
        allNodes,
        allEdges,
        nodeOutputs,
      );
      return nodeRunner(input);
    });

    // Execute all nodes in parallel and wait for all to complete
    const results = await Promise.all(promises);

    // Map the results to node IDs
    const namedResults: Record<string, any> = {};
    parallelNodes.forEach((node, index) => {
      namedResults[node.id] = results[index];
    });

    return namedResults;
  } catch (error) {
    console.error("Error executing parallel nodes:", error);
    throw error;
  }
};

/**
 * Update the workflow execution engine to use the LangGraph executor
 */
export const upgradeToLangGraphExecution = () => {
  // Override the executeWorkflow function to use LangGraph
  (workflowExecutionEngine as any).executeWorkflow = async (
    nodes: Node[],
    edges: Edge[],
  ) => {
    return executeLangGraphWorkflow(nodes, edges);
  };

  console.log("Workflow execution engine upgraded to use LangGraph");
};
