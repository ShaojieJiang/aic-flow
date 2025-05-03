import { Node } from "@xyflow/react";
import { v4 as uuidv4 } from "uuid";
import { NodeDefinition } from "@/nodes/types";

/**
 * Creates a new node instance from a node definition
 *
 * @param nodeDefinition Node type definition
 * @param position Initial position on the canvas
 * @param id Optional custom ID (defaults to generated UUID)
 * @returns A new node instance
 */
export const createNodeFromDefinition = (
  nodeDefinition: NodeDefinition,
  position: { x: number; y: number },
  id?: string,
): Node => {
  // Use literal IDs for START and END nodes
  const nodeId =
    nodeDefinition.label === "START"
      ? "START"
      : nodeDefinition.label === "END"
        ? "END"
        : id || `${nodeDefinition.id}-${uuidv4().substring(0, 8)}`;

  return {
    id: nodeId,
    type: nodeDefinition.type,
    position,
    data: {
      id: nodeId,
      label: nodeDefinition.label,
      description: nodeDefinition.description,
      category: nodeDefinition.category,
      icon: nodeDefinition.icon,
      emoji: nodeDefinition.emoji,
      inputs: nodeDefinition.inputs,
      outputs: nodeDefinition.outputs,
      actionType: nodeDefinition.id,
      config: {}, // Initialize empty config
      onConfigUpdate: () => {}, // Will be overridden when added to canvas
    },
  };
};
