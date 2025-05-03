import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Settings, Edit, Trash2, Play } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import { Layout, LayoutBody, LayoutHeader } from "@/components/ui/layout";
import { ThemeToggle } from "@/components/theme-toggle";

// Sample workflow data (in a real app, this would come from API)
const sampleWorkflows = [
  {
    id: "workflow-1",
    name: "Customer Data ETL",
    description:
      "Extract, transform, and load customer data from CRM to data warehouse",
    tags: ["ETL", "CRM"],
    lastUpdated: "2025-04-28",
    thumbnail: null,
    nodeCount: 6,
    edgeCount: 5,
  },
  {
    id: "workflow-2",
    name: "Email Campaign Automation",
    description: "Segment customers and send personalized email campaigns",
    tags: ["Marketing", "Email"],
    lastUpdated: "2025-04-27",
    thumbnail: null,
    nodeCount: 8,
    edgeCount: 7,
  },
  {
    id: "workflow-3",
    name: "Support Ticket Classifier",
    description: "Classify and route support tickets using AI",
    tags: ["AI", "Support"],
    lastUpdated: "2025-04-26",
    thumbnail: null,
    nodeCount: 5,
    edgeCount: 4,
  },
  {
    id: "workflow-4",
    name: "Inventory Sync",
    description: "Sync inventory levels between e-commerce platforms",
    tags: ["E-commerce", "Integration"],
    lastUpdated: "2025-04-25",
    thumbnail: null,
    nodeCount: 4,
    edgeCount: 3,
  },
  {
    id: "workflow-5",
    name: "Sales Dashboard",
    description: "Generate and distribute sales reports automatically",
    tags: ["Sales", "Reporting"],
    lastUpdated: "2025-04-24",
    thumbnail: null,
    nodeCount: 7,
    edgeCount: 6,
  },
];

const Gallery: React.FC = () => {
  const [workflows, setWorkflows] = useState(sampleWorkflows);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Filter workflows based on search term
  const filteredWorkflows = workflows.filter(
    (workflow) =>
      workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  const handleEdit = (workflowId: string) => {
    navigate(`/editor/${workflowId}`);
  };

  const handleRun = (workflowId: string) => {
    toast({
      title: "Workflow Running",
      description: `Started execution of workflow ${workflowId}`,
    });
  };

  const handleDelete = (workflowId: string) => {
    if (confirm("Are you sure you want to delete this workflow?")) {
      setWorkflows(workflows.filter((w) => w.id !== workflowId));
      toast({
        title: "Workflow Deleted",
        description: "The workflow has been deleted",
      });
    }
  };

  const handleCreateNew = () => {
    navigate("/editor");
  };

  return (
    <Layout>
      <LayoutHeader className="border-b">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Link to="/gallery" className="flex items-center font-bold text-xl">
              AIC Flow
            </Link>
            <span className="text-sm text-muted-foreground">v0.0.1</span>
          </div>
          <div className="flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </LayoutHeader>
      <LayoutBody>
        <div className="container mx-auto py-8 flex flex-col h-[calc(100vh-4rem)]">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Workflow Gallery</h1>
            <Button onClick={handleCreateNew}>
              <Plus size={16} className="mr-2" /> New Workflow
            </Button>
          </div>

          <div className="mb-6">
            <Input
              placeholder="Search workflows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          <ScrollArea className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkflows.length > 0 ? (
                filteredWorkflows.map((workflow) => (
                  <Card key={workflow.id} className="overflow-hidden">
                    <CardHeader className="p-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {workflow.name}
                        </CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Settings size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleEdit(workflow.id)}
                            >
                              <Edit size={14} className="mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRun(workflow.id)}
                            >
                              <Play size={14} className="mr-2" /> Run
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(workflow.id)}
                            >
                              <Trash2 size={14} className="mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <CardDescription>{workflow.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-sm text-muted-foreground">
                        <p>
                          {workflow.nodeCount} nodes • {workflow.edgeCount}{" "}
                          connections
                        </p>
                        <p>Last updated: {workflow.lastUpdated}</p>
                      </div>
                      <div className="flex gap-2 mt-2">
                        {workflow.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleEdit(workflow.id)}
                      >
                        <Edit size={14} className="mr-1" /> Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRun(workflow.id)}
                      >
                        <Play size={14} className="mr-1" /> Run
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No workflows found matching your search.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </LayoutBody>
    </Layout>
  );
};

export default Gallery;
