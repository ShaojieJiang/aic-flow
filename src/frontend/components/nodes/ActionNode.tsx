import React from "react";
import { NodeProps } from "@xyflow/react";
import BaseNode from "./BaseNode";
import { BaseNodeData } from "./BaseNode";

// Make ActionNodeData extend BaseNodeData
export interface ActionNodeData extends BaseNodeData {
  actionType: string;
}

// Use the generic NodeProps without constraints
const ActionNode: React.FC<NodeProps> = (props) => {
  // Simply pass props to BaseNode, as we're just extending its functionality
  return <BaseNode {...props} />;
};

export default ActionNode;
