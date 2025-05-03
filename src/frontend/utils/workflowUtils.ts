/**
 * Extracts a human-readable workflow name from a workflow ID
 *
 * @param workflowId The workflow ID from URL
 * @returns A formatted workflow name
 */
export const getWorkflowNameFromId = (workflowId: string): string => {
  // Remove any prefix/path
  const cleanId = workflowId.split("/").pop() || workflowId;

  // Replace dashes and underscores with spaces
  const withSpaces = cleanId.replace(/[-_]/g, " ");

  // Capitalize words
  return withSpaces
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
