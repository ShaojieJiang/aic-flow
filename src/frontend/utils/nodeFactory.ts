import { Node } from "@xyflow/react";
import { NodeTypeDefinition } from "@/nodes/types";

// Utility to create a node from a type definition
export function createNodeFromDefinition(
  typeDefinition: NodeTypeDefinition,
  position: { x: number; y: number },
  id?: string,
): Node {
  const nodeId = id || `${typeDefinition.id}-${Date.now()}`;

  return {
    id: nodeId,
    type: typeDefinition.type,
    position,
    data: {
      id: nodeId,
      label: typeDefinition.label,
      description: typeDefinition.description,
      category: typeDefinition.category,
      icon: typeDefinition.icon, // Include icon in node data
      actionType: typeDefinition.id,
      inputs: typeDefinition.inputs,
      outputs: typeDefinition.outputs,
      config: { ...typeDefinition.defaultConfig },
      executionHistory: [],
      onRun: async (
        nodeId: string,
        inputs: Record<string, any>,
        config: Record<string, any>,
      ) => {
        console.log(`Running ${typeDefinition.label} node ${nodeId}`);

        // Use the executor if provided, otherwise simulate a default response
        if (typeDefinition.executor) {
          return await typeDefinition.executor(inputs, config);
        }

        return { result: `Default output from ${typeDefinition.label}` };
      },
    },
    className: `${typeDefinition.category}-node`,
  };
}
