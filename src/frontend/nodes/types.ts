// Comprehensive node types based on the PRD requirements

export enum NodeCategory {
  SOURCE = "source",
  SINK = "sink",
  PROCESSING = "processing",
  CONTROL_FLOW = "control-flow",
  INTEGRATION = "integration",
  CUSTOM = "custom",
}

export interface NodePort {
  id: string;
  type: "string" | "number" | "boolean" | "object" | "array" | "any";
  description?: string;
  required?: boolean;
  defaultValue?: any;
}

export interface NodeTypeDefinition {
  id: string;
  type: string;
  category: NodeCategory;
  label: string;
  description: string;
  icon: string; // Updated to be required
  inputs: Record<string, NodePort>;
  outputs: Record<string, NodePort>;
  configOptions: any[];
  defaultConfig: Record<string, any>;
  executor?: (
    inputs: Record<string, any>,
    config: Record<string, any>,
  ) => Promise<Record<string, any>>;
}

// Source node types (data input)
export const SOURCE_NODE_TYPES: NodeTypeDefinition[] = [
  {
    id: "rest-get",
    type: "actionNode",
    category: NodeCategory.SOURCE,
    label: "HTTP Request",
    description: "Fetch data from a REST API endpoint using GET",
    icon: "globe",
    inputs: {},
    outputs: {
      response: {
        id: "response",
        type: "object",
        description: "Response data",
      },
      status: { id: "status", type: "number", description: "HTTP status code" },
    },
    configOptions: [
      { name: "url", type: "string", required: true },
      { name: "headers", type: "object", required: false },
    ],
    defaultConfig: {
      url: "https://api.example.com/data",
      method: "GET",
      headers: {},
    },
    executor: async (inputs, config) => {
      try {
        // In real implementation, this would make an actual HTTP request
        console.log(`Making GET request to ${config.url}`);
        return {
          response: { data: "Sample response data" },
          status: 200,
        };
      } catch (error) {
        console.error("HTTP Request failed", error);
        return {
          error: "Request failed",
          status: 500,
        };
      }
    },
  },
  {
    id: "db-query",
    type: "actionNode",
    category: NodeCategory.SOURCE,
    label: "Database Query",
    description: "Query a database for data",
    icon: "database",
    inputs: {
      parameters: {
        id: "parameters",
        type: "object",
        description: "Query parameters",
        required: false,
      },
    },
    outputs: {
      results: { id: "results", type: "array", description: "Query results" },
      count: { id: "count", type: "number", description: "Number of records" },
    },
    configOptions: [
      { name: "query", type: "string", required: true },
      { name: "connectionId", type: "string", required: true },
    ],
    defaultConfig: {
      query: "SELECT * FROM users LIMIT 10;",
      connectionId: "default",
    },
  },
  {
    id: "webhook",
    type: "actionNode",
    category: NodeCategory.SOURCE,
    label: "Webhook",
    description: "Receive data from external webhook calls",
    icon: "arrow-down",
    inputs: {},
    outputs: {
      payload: {
        id: "payload",
        type: "object",
        description: "Webhook payload",
      },
      headers: {
        id: "headers",
        type: "object",
        description: "Request headers",
      },
    },
    configOptions: [
      { name: "path", type: "string", required: true },
      { name: "method", type: "string", required: true },
    ],
    defaultConfig: {
      path: "/webhook",
      method: "POST",
    },
  },
  {
    id: "cron",
    type: "actionNode",
    category: NodeCategory.SOURCE,
    label: "Cron Schedule",
    description: "Trigger flow on a schedule",
    icon: "clock",
    inputs: {},
    outputs: {
      timestamp: {
        id: "timestamp",
        type: "string",
        description: "Execution time",
      },
    },
    configOptions: [
      { name: "schedule", type: "string", required: true },
      { name: "timezone", type: "string", required: false },
    ],
    defaultConfig: {
      schedule: "0 0 * * *", // Midnight every day
      timezone: "UTC",
    },
  },
];

// Sink node types (data output)
export const SINK_NODE_TYPES: NodeTypeDefinition[] = [
  {
    id: "rest-post",
    type: "actionNode",
    category: NodeCategory.SINK,
    label: "HTTP POST",
    description: "Send data to a REST API endpoint using POST",
    icon: "send",
    inputs: {
      data: {
        id: "data",
        type: "object",
        description: "Data to send",
        required: true,
      },
    },
    outputs: {
      response: {
        id: "response",
        type: "object",
        description: "Response data",
      },
      status: { id: "status", type: "number", description: "HTTP status code" },
    },
    configOptions: [
      { name: "url", type: "string", required: true },
      { name: "headers", type: "object", required: false },
    ],
    defaultConfig: {
      url: "https://api.example.com/data",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
  },
  {
    id: "file-export",
    type: "actionNode",
    category: NodeCategory.SINK,
    label: "File Export",
    description: "Export data to a file (CSV, JSON, etc.)",
    icon: "file-text",
    inputs: {
      data: {
        id: "data",
        type: "any",
        description: "Data to export",
        required: true,
      },
    },
    outputs: {
      success: {
        id: "success",
        type: "boolean",
        description: "Export success status",
      },
      path: {
        id: "path",
        type: "string",
        description: "Path to exported file",
      },
    },
    configOptions: [
      { name: "format", type: "string", required: true },
      { name: "filepath", type: "string", required: true },
    ],
    defaultConfig: {
      format: "json",
      filepath: "/exports/data.json",
    },
  },
  {
    id: "notification",
    type: "actionNode",
    category: NodeCategory.SINK,
    label: "Notification",
    description: "Send a notification (email, Slack, etc.)",
    icon: "bell",
    inputs: {
      subject: {
        id: "subject",
        type: "string",
        description: "Notification subject",
        required: true,
      },
      body: {
        id: "body",
        type: "string",
        description: "Notification body",
        required: true,
      },
    },
    outputs: {
      success: {
        id: "success",
        type: "boolean",
        description: "Notification sent status",
      },
      id: { id: "id", type: "string", description: "Notification ID" },
    },
    configOptions: [
      { name: "channel", type: "string", required: true },
      { name: "recipients", type: "array", required: true },
    ],
    defaultConfig: {
      channel: "email",
      recipients: ["user@example.com"],
    },
  },
];

// Processing node types (data transformation)
export const PROCESSING_NODE_TYPES: NodeTypeDefinition[] = [
  {
    id: "python",
    type: "actionNode",
    category: NodeCategory.PROCESSING,
    label: "Python Code",
    description: "Execute custom Python code",
    icon: "code",
    inputs: {
      data: {
        id: "data",
        type: "any",
        description: "Input data",
        required: false,
      },
    },
    outputs: {
      result: { id: "result", type: "any", description: "Output data" },
    },
    configOptions: [{ name: "code", type: "code", required: true }],
    defaultConfig: {
      code: 'def process(data):\n    return {"result": data}\n\noutputs = process(inputs.get("data", {}))',
    },
  },
  {
    id: "transform",
    type: "actionNode",
    category: NodeCategory.PROCESSING,
    label: "Data Transform",
    description: "Transform data using mapping template",
    icon: "layers",
    inputs: {
      input: {
        id: "input",
        type: "any",
        description: "Input data",
        required: true,
      },
    },
    outputs: {
      output: { id: "output", type: "any", description: "Transformed data" },
    },
    configOptions: [{ name: "mapping", type: "json", required: true }],
    defaultConfig: {
      mapping: '{ "output": "{{ input.value }}" }',
    },
  },
  {
    id: "agent",
    type: "actionNode",
    category: NodeCategory.PROCESSING,
    label: "AI Agent",
    description: "Process data using an AI agent",
    icon: "square-check",
    inputs: {
      prompt: {
        id: "prompt",
        type: "string",
        description: "Instructions or data",
        required: true,
      },
    },
    outputs: {
      response: {
        id: "response",
        type: "string",
        description: "Agent response",
      },
      analysis: {
        id: "analysis",
        type: "object",
        description: "Analysis results",
      },
    },
    configOptions: [
      { name: "model", type: "string", required: true },
      { name: "temperature", type: "number", required: false },
    ],
    defaultConfig: {
      model: "gpt-4",
      temperature: 0.7,
    },
  },
];

// Control flow node types
export const CONTROL_FLOW_NODE_TYPES: NodeTypeDefinition[] = [
  {
    id: "if-else",
    type: "actionNode",
    category: NodeCategory.CONTROL_FLOW,
    label: "If/Else",
    description: "Conditionally route flow based on input",
    icon: "git-branch",
    inputs: {
      condition: {
        id: "condition",
        type: "any",
        description: "Condition to evaluate",
        required: true,
      },
    },
    outputs: {
      true: { id: "true", type: "any", description: "Output if true" },
      false: { id: "false", type: "any", description: "Output if false" },
    },
    configOptions: [{ name: "expression", type: "string", required: true }],
    defaultConfig: {
      expression: "value > 0",
    },
  },
  {
    id: "foreach",
    type: "actionNode",
    category: NodeCategory.CONTROL_FLOW,
    label: "For Each",
    description: "Process items in a collection",
    icon: "list",
    inputs: {
      collection: {
        id: "collection",
        type: "array",
        description: "Items to process",
        required: true,
      },
    },
    outputs: {
      item: { id: "item", type: "any", description: "Current item" },
      index: { id: "index", type: "number", description: "Current index" },
      result: {
        id: "result",
        type: "array",
        description: "Aggregated results",
      },
    },
    configOptions: [{ name: "concurrency", type: "number", required: false }],
    defaultConfig: {
      concurrency: 1,
    },
  },
  {
    id: "while",
    type: "actionNode",
    category: NodeCategory.CONTROL_FLOW,
    label: "While Loop",
    description: "Execute repeatedly while condition is true",
    icon: "circle-arrow-right",
    inputs: {
      initial: {
        id: "initial",
        type: "any",
        description: "Initial value",
        required: true,
      },
    },
    outputs: {
      result: { id: "result", type: "any", description: "Loop result" },
      iterations: {
        id: "iterations",
        type: "number",
        description: "Iteration count",
      },
    },
    configOptions: [
      { name: "condition", type: "string", required: true },
      { name: "maxIterations", type: "number", required: true },
    ],
    defaultConfig: {
      condition: "value < 10",
      maxIterations: 100,
    },
  },
];

// Integration node types
export const INTEGRATION_NODE_TYPES: NodeTypeDefinition[] = [
  {
    id: "subflow",
    type: "actionNode",
    category: NodeCategory.INTEGRATION,
    label: "Sub-workflow",
    description: "Run another workflow as a step",
    icon: "folder",
    inputs: {
      params: {
        id: "params",
        type: "object",
        description: "Workflow parameters",
        required: false,
      },
    },
    outputs: {
      result: { id: "result", type: "any", description: "Workflow output" },
    },
    configOptions: [{ name: "workflowId", type: "string", required: true }],
    defaultConfig: {
      workflowId: "",
    },
  },
  {
    id: "chat",
    type: "actionNode",
    category: NodeCategory.INTEGRATION,
    label: "Chat Interface",
    description: "Interactive chat with user mid-flow",
    icon: "folder-open",
    inputs: {
      message: {
        id: "message",
        type: "string",
        description: "Message to user",
        required: true,
      },
    },
    outputs: {
      response: {
        id: "response",
        type: "string",
        description: "User response",
      },
    },
    configOptions: [{ name: "timeout", type: "number", required: false }],
    defaultConfig: {
      timeout: 300,
    },
  },
];

// Custom node types
export const CUSTOM_NODE_TYPES: NodeTypeDefinition[] = [
  {
    id: "custom",
    type: "actionNode",
    category: NodeCategory.CUSTOM,
    label: "Custom Plugin",
    description: "Custom plugin node",
    icon: "square-plus",
    inputs: {
      data: {
        id: "data",
        type: "any",
        description: "Input data",
        required: false,
      },
    },
    outputs: {
      result: { id: "result", type: "any", description: "Output data" },
    },
    configOptions: [],
    defaultConfig: {},
  },
];

// All node types
export const ALL_NODE_TYPES: NodeTypeDefinition[] = [
  ...SOURCE_NODE_TYPES,
  ...SINK_NODE_TYPES,
  ...PROCESSING_NODE_TYPES,
  ...CONTROL_FLOW_NODE_TYPES,
  ...INTEGRATION_NODE_TYPES,
  ...CUSTOM_NODE_TYPES,
];

export function getNodeDefinition(
  typeId: string,
): NodeTypeDefinition | undefined {
  return ALL_NODE_TYPES.find((nt) => nt.id === typeId);
}
