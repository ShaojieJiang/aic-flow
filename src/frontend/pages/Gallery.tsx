import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, FileSymlink, Plus, Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { DEMO_WORKFLOWS } from "@/data/demoWorkflows";

const Gallery = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredWorkflows = DEMO_WORKFLOWS.filter(
    (wf) =>
      wf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wf.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCardDoubleClick = (workflowId: string) => {
    navigate(`/editor/${workflowId}`);
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Workflow Gallery</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button onClick={() => navigate("/editor")} className="gap-1">
            <Plus size={16} />
            New Workflow
          </Button>
        </div>
      </div>

      <div className="relative mb-6">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
          size={18}
        />
        <Input
          placeholder="Search workflows..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkflows.map((workflow) => (
          <Card
            key={workflow.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/editor/${workflow.id}`)}
            onDoubleClick={() => handleCardDoubleClick(workflow.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{workflow.name}</CardTitle>
                <Badge
                  variant={
                    workflow.status === "active"
                      ? "default"
                      : workflow.status === "draft"
                        ? "outline"
                        : "secondary"
                  }
                >
                  {workflow.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {workflow.description}
              </p>
            </CardContent>
            <CardFooter className="pt-0 flex justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>{formatDate(workflow.lastModified)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{workflow.runs} runs</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/editor/${workflow.id}`);
                }}
              >
                <FileSymlink size={14} />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
