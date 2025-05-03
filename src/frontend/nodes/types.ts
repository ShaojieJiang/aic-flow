export enum NodeCategory {
  SOURCE = "Source",
  SINK = "Sink",
  PROCESSING = "Processing",
  CONTROL_FLOW = "Control Flow",
  INTEGRATION = "Integration",
  CUSTOM = "Custom",
  SPECIAL = "Special",
}

export interface NodeDefinition {
  id: string;
  label: string;
  type: string;
  description: string;
  category: NodeCategory;
  icon: string;
  emoji?: string;
  inputs: Record<string, { type: string }>;
  outputs: Record<string, { type: string }>;
}

// Source Nodes
export const SOURCE_NODE_TYPES: NodeDefinition[] = [
  {
    id: "rest-get",
    label: "REST API",
    type: "actionNode",
    description: "Fetch data from REST API endpoints",
    category: NodeCategory.SOURCE,
    icon: "ArrowDownToLine",
    emoji: "🔄",
    inputs: {},
    outputs: { data: { type: "object" } },
  },
  {
    id: "database-query",
    label: "DB Query",
    type: "actionNode",
    description: "Query a database for data",
    category: NodeCategory.SOURCE,
    icon: "Database",
    emoji: "🗄️",
    inputs: {},
    outputs: { results: { type: "array" } },
  },
  {
    id: "webhook",
    label: "Webhook",
    type: "actionNode",
    description: "Receive data from webhooks",
    category: NodeCategory.SOURCE,
    icon: "Webhook",
    emoji: "🪝",
    inputs: {},
    outputs: { payload: { type: "object" } },
  },
  {
    id: "cron",
    label: "Scheduler",
    type: "actionNode",
    description: "Run workflow on schedule",
    category: NodeCategory.SOURCE,
    icon: "Clock",
    emoji: "⏱️",
    inputs: {},
    outputs: { trigger: { type: "event" } },
  },
];

// Sink Nodes
export const SINK_NODE_TYPES: NodeDefinition[] = [
  {
    id: "rest-post",
    label: "REST Post",
    type: "actionNode",
    description: "Send data to REST API endpoints",
    category: NodeCategory.SINK,
    icon: "ArrowUpToLine",
    emoji: "📤",
    inputs: { data: { type: "object" } },
    outputs: { response: { type: "object" } },
  },
  {
    id: "file-export",
    label: "File Export",
    type: "actionNode",
    description: "Export data to files",
    category: NodeCategory.SINK,
    icon: "FileOutput",
    emoji: "📁",
    inputs: { data: { type: "any" } },
    outputs: { success: { type: "boolean" } },
  },
  {
    id: "notification",
    label: "Notification",
    type: "actionNode",
    description: "Send notifications",
    category: NodeCategory.SINK,
    icon: "Bell",
    emoji: "🔔",
    inputs: { message: { type: "string" } },
    outputs: { sent: { type: "boolean" } },
  },
];

// Processing Nodes
export const PROCESSING_NODE_TYPES: NodeDefinition[] = [
  {
    id: "PythonCode",
    label: "Python",
    type: "actionNode",
    description: "Execute Python code",
    category: NodeCategory.PROCESSING,
    icon: "Code",
    emoji: "🐍",
    inputs: { data: { type: "any" } },
    outputs: { result: { type: "any" } },
  },
  {
    id: "transform",
    label: "Transform",
    type: "actionNode",
    description: "Transform data between formats",
    category: NodeCategory.PROCESSING,
    icon: "Shuffle",
    emoji: "🔄",
    inputs: { input: { type: "any" } },
    outputs: { output: { type: "any" } },
  },
  {
    id: "agent",
    label: "AI Agent",
    type: "actionNode",
    description: "AI-powered processing",
    category: NodeCategory.PROCESSING,
    icon: "Brain",
    emoji: "🧠",
    inputs: { query: { type: "string" } },
    outputs: { response: { type: "string" } },
  },
];

// Control Flow Nodes
export const CONTROL_FLOW_NODE_TYPES: NodeDefinition[] = [
  {
    id: "if-else",
    label: "If/Else",
    type: "actionNode",
    description: "Conditional branching",
    category: NodeCategory.CONTROL_FLOW,
    icon: "GitFork",
    emoji: "🔀",
    inputs: { condition: { type: "boolean" } },
    outputs: {
      true: { type: "any" },
      false: { type: "any" },
    },
  },
  {
    id: "for-each",
    label: "For Each",
    type: "actionNode",
    description: "Iterate over collections",
    category: NodeCategory.CONTROL_FLOW,
    icon: "Repeat",
    emoji: "🔁",
    inputs: { items: { type: "array" } },
    outputs: { result: { type: "array" } },
  },
  {
    id: "while",
    label: "While Loop",
    type: "actionNode",
    description: "Loop while condition is true",
    category: NodeCategory.CONTROL_FLOW,
    icon: "CircleDashed",
    emoji: "⭕",
    inputs: { condition: { type: "boolean" } },
    outputs: { result: { type: "any" } },
  },
];

// Integration Nodes
export const INTEGRATION_NODE_TYPES: NodeDefinition[] = [
  {
    id: "subflow",
    label: "Sub-workflow",
    type: "actionNode",
    description: "Call another workflow",
    category: NodeCategory.INTEGRATION,
    icon: "Component",
    emoji: "📦",
    inputs: { params: { type: "object" } },
    outputs: { result: { type: "any" } },
  },
  {
    id: "chat-handler",
    label: "Chat Handler",
    type: "actionNode",
    description: "Process chat messages",
    category: NodeCategory.INTEGRATION,
    icon: "MessageSquare",
    emoji: "💬",
    inputs: { message: { type: "string" } },
    outputs: { response: { type: "string" } },
  },
];

// Custom Nodes
export const CUSTOM_NODE_TYPES: NodeDefinition[] = [
  {
    id: "custom-node",
    label: "Custom Node",
    type: "baseNode",
    description: "User-defined custom node",
    category: NodeCategory.CUSTOM,
    icon: "Puzzle",
    emoji: "🧩",
    inputs: { custom: { type: "any" } },
    outputs: { result: { type: "any" } },
  },
];

// Special nodes - START and END - now moved to their own category for library
export const SPECIAL_NODE_TYPES: NodeDefinition[] = [
  {
    id: "start",
    label: "START",
    type: "baseNode",
    description: "Workflow entry point",
    category: NodeCategory.SPECIAL,
    icon: "Play",
    emoji: "▶️",
    inputs: {},
    outputs: { out: { type: "any" } },
  },
  {
    id: "end",
    label: "END",
    type: "baseNode",
    description: "Workflow exit point",
    category: NodeCategory.SPECIAL,
    icon: "Square",
    emoji: "⏹️",
    inputs: { in: { type: "any" } },
    outputs: {},
  },
];

// Combined node types for easy access
export const ALL_NODE_TYPES: NodeDefinition[] = [
  ...SOURCE_NODE_TYPES,
  ...SINK_NODE_TYPES,
  ...PROCESSING_NODE_TYPES,
  ...CONTROL_FLOW_NODE_TYPES,
  ...INTEGRATION_NODE_TYPES,
  ...CUSTOM_NODE_TYPES,
];
