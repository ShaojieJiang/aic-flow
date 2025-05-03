import { DEMO_WORKFLOWS } from "@/data/demoWorkflows";

export interface WorkflowInfo {
  id: string;
  name: string;
  description: string;
  lastModified: string;
  status: "active" | "draft" | "archived";
  runs: number;
}

/**
 * Get workflow information by ID
 */
export async function getWorkflowById(
  id: string,
): Promise<WorkflowInfo | undefined> {
  // In a real app, this would be an API call
  // For now, we'll use demo data

  // Find the workflow in our demo data
  const workflow = DEMO_WORKFLOWS.find((w) => w.id === id);

  // Simulate some API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  return workflow;
}

/**
 * Get all workflows
 */
export async function getAllWorkflows(): Promise<WorkflowInfo[]> {
  // In a real app, this would be an API call
  // For now, we'll use demo data

  // Simulate some API delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  return DEMO_WORKFLOWS;
}

/**
 * Save workflow
 */
export async function saveWorkflow(
  workflow: WorkflowInfo,
): Promise<WorkflowInfo> {
  // In a real app, this would be an API call
  // For now, we'll just return the data

  // Simulate some API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    ...workflow,
    lastModified: new Date().toISOString(),
  };
}
