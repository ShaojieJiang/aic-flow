export const DEMO_WORKFLOWS = [
  {
    id: "workflow-1",
    name: "Customer Data Processing",
    description:
      "Extract customer data from CRM, transform, and load into analytics dashboard",
    lastModified: "2025-05-01T10:30:00Z",
    status: "active" as const,
    runs: 128,
  },
  {
    id: "workflow-2",
    name: "Sales Notification System",
    description: "Send notifications to sales team when new leads are created",
    lastModified: "2025-04-28T14:15:00Z",
    status: "active" as const,
    runs: 56,
  },
  {
    id: "workflow-3",
    name: "Document Classification",
    description: "Classify incoming documents using machine learning",
    lastModified: "2025-04-25T09:45:00Z",
    status: "draft" as const,
    runs: 12,
  },
  {
    id: "workflow-4",
    name: "Inventory Alerts",
    description: "Send alerts when inventory levels drop below threshold",
    lastModified: "2025-04-20T16:20:00Z",
    status: "archived" as const,
    runs: 230,
  },
];
