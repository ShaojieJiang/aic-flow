import React, { useState } from "react";
import { Search, ChevronRight, ChevronLeft, ChevronDown } from "lucide-react";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SOURCE_NODE_TYPES,
  SINK_NODE_TYPES,
  PROCESSING_NODE_TYPES,
  CONTROL_FLOW_NODE_TYPES,
  INTEGRATION_NODE_TYPES,
  CUSTOM_NODE_TYPES,
  SPECIAL_NODE_TYPES,
  NodeCategory,
} from "@/nodes/types";
import { createNodeFromDefinition } from "@/utils/nodeFactory";

interface NodeLibraryProps {
  onAddNode: (node: any) => void;
}

interface NodeCategorySection {
  category: NodeCategory;
  title: string;
  nodes: any[];
  expanded: boolean;
}

// Helper to get icon component
const getIconComponent = (iconName: string): React.ReactNode => {
  // Default to Settings if icon name doesn't exist
  const IconComponent = (Icons as any)[iconName] || Icons.ChevronsRight;
  return <IconComponent className="h-4 w-4" />;
};

const NodeLibrary: React.FC<NodeLibraryProps> = ({ onAddNode }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<NodeCategorySection[]>([
    {
      category: NodeCategory.SPECIAL,
      title: "Special Nodes",
      nodes: SPECIAL_NODE_TYPES,
      expanded: true,
    },
    {
      category: NodeCategory.SOURCE,
      title: "Data Sources",
      nodes: SOURCE_NODE_TYPES,
      expanded: true,
    },
    {
      category: NodeCategory.SINK,
      title: "Data Destinations",
      nodes: SINK_NODE_TYPES,
      expanded: true,
    },
    {
      category: NodeCategory.PROCESSING,
      title: "Processing",
      nodes: PROCESSING_NODE_TYPES,
      expanded: true,
    },
    {
      category: NodeCategory.CONTROL_FLOW,
      title: "Control Flow",
      nodes: CONTROL_FLOW_NODE_TYPES,
      expanded: false,
    },
    {
      category: NodeCategory.INTEGRATION,
      title: "Integrations",
      nodes: INTEGRATION_NODE_TYPES,
      expanded: false,
    },
    {
      category: NodeCategory.CUSTOM,
      title: "Custom",
      nodes: CUSTOM_NODE_TYPES,
      expanded: false,
    },
  ]);

  const toggleCategory = (index: number) => {
    setCategories(
      categories.map((cat, i) =>
        i === index ? { ...cat, expanded: !cat.expanded } : cat,
      ),
    );
  };

  const handleAddNode = (nodeType: any) => {
    const newNode = createNodeFromDefinition(nodeType, { x: 100, y: 100 });
    onAddNode(newNode);
  };

  // Filter nodes based on search term
  const filteredCategories = categories
    .map((category) => ({
      ...category,
      nodes: category.nodes.filter(
        (node) =>
          node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          node.description.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }))
    .filter((category) => category.nodes.length > 0);

  return (
    <div
      className={`border-r transition-all ${isOpen ? "w-72" : "w-12"} overflow-hidden`}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="h-full">
        <CollapsibleTrigger asChild>
          <div className="p-3 border-b cursor-pointer flex items-center justify-between">
            <div className="flex items-center">
              <Search className="mr-2" size={16} />
              {isOpen && (
                <span className="text-sm font-medium">Node Library</span>
              )}
            </div>
            {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="flex flex-col h-[calc(100%-48px)]">
          <div className="p-3 border-b">
            <Input
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-sm"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {filteredCategories.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                No nodes match your search
              </div>
            ) : (
              filteredCategories.map((category, index) => (
                <div key={category.title} className="mb-3">
                  <div
                    className="flex items-center justify-between cursor-pointer p-1 hover:bg-accent rounded text-sm font-medium"
                    onClick={() => toggleCategory(index)}
                  >
                    <span>{category.title}</span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${
                        category.expanded ? "" : "-rotate-90"
                      }`}
                    />
                  </div>

                  {category.expanded && (
                    <div className="space-y-1 mt-1 pl-2">
                      {category.nodes.map((nodeType) => (
                        <Button
                          key={nodeType.id}
                          variant="ghost"
                          size="sm"
                          className={`w-full justify-start text-xs py-1 px-2 h-auto ${category.category}-text`}
                          onClick={() => handleAddNode(nodeType)}
                        >
                          <div className="flex items-center w-full">
                            <div className="mr-2">
                              {getIconComponent(nodeType.icon)}
                            </div>
                            <div className="flex flex-col items-start">
                              <span>{nodeType.label}</span>
                              <span className="text-xs text-muted-foreground truncate max-w-full">
                                {nodeType.description.length > 30
                                  ? `${nodeType.description.substring(0, 30)}...`
                                  : nodeType.description}
                              </span>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  )}

                  <Separator className="my-2" />
                </div>
              ))
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default NodeLibrary;
