import React, { useState } from "react";
import { List, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface NodeLibraryProps {
  onAddNode: (nodeType: string, nodeData: any) => void;
}

const NodeLibrary: React.FC<NodeLibraryProps> = ({ onAddNode }) => {
  const [isOpen, setIsOpen] = useState(true);

  // Available node templates
  const nodeTemplates = [
    {
      type: "actionNode",
      category: "Actions",
      label: "HTTP Request",
      data: {
        actionType: "http",
        label: "HTTP Request",
        inputs: { url: { type: "string" } },
        outputs: { response: { type: "object" } },
        config: {
          url: "https://api.example.com/data",
          method: "GET",
        },
        executionHistory: [],
      },
    },
    {
      type: "actionNode",
      category: "Actions",
      label: "Process Data",
      data: {
        actionType: "function",
        label: "Process Data",
        inputs: { data: { type: "object" } },
        outputs: { result: { type: "string" } },
        config: {
          function: "return inputs.data.toUpperCase();",
        },
        executionHistory: [],
      },
    },
  ];

  const handleAddNode = (template: any) => {
    // Generate a simple random ID
    const nodeId =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    onAddNode(template.type, {
      id: nodeId,
      label: template.label,
      actionType: template.data.actionType,
      inputs: template.data.inputs,
      outputs: template.data.outputs,
      config: template.data.config,
      executionHistory: [],
      onRun: async (
        nodeId: string,
        inputs: Record<string, any>,
        config: Record<string, any>,
      ) => {
        console.log(`Running ${template.label} node ${nodeId}`);
        // Default implementation
        return { result: "Default output" };
      },
    });
  };

  return (
    <div
      className={`border-r transition-all ${isOpen ? "w-64" : "w-12"} overflow-hidden`}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="h-full">
        <CollapsibleTrigger asChild>
          <div className="p-3 border-b cursor-pointer flex items-center justify-between">
            <div className="flex items-center">
              <List className="mr-2" size={16} />
              {isOpen && (
                <span className="text-sm font-medium">Node Library</span>
              )}
            </div>
            {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="p-4 overflow-y-auto">
          <Separator className="my-2" />

          {["Actions"].map((category) => (
            <div key={category} className="mb-4">
              <h3 className="text-xs text-gray-500 mb-2">{category}</h3>
              <div className="space-y-2">
                {nodeTemplates
                  .filter((t) => t.category === category)
                  .map((template, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs"
                      onClick={() => handleAddNode(template)}
                    >
                      {template.label}
                    </Button>
                  ))}
              </div>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default NodeLibrary;
