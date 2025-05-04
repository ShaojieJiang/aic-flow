import React, { useState, useEffect } from "react";
import Split from "react-split";
import { Editor } from "@monaco-editor/react";
import ReactJson from "react-json-view";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { BaseNodeData } from "./nodes/BaseNode";
import { ActionNodeData } from "./nodes/ActionNode";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Use a union type for flexibility
type NodeData = BaseNodeData | ActionNodeData;

interface NodeInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  node: NodeData | null;
  onSave: (nodeId: string, config: Record<string, any>) => void;
}

const NodeInspector: React.FC<NodeInspectorProps> = ({
  isOpen,
  onClose,
  node,
  onSave,
}) => {
  const [activeInputTab, setActiveInputTab] = useState("schema");
  const [activeOutputTab, setActiveOutputTab] = useState("schema");
  const [config, setConfig] = useState<Record<string, any>>({});
  const [inputData, setInputData] = useState<any>({});
  const [outputData, setOutputData] = useState<any>({});

  // Schema for basic validation
  const schema = z.object({
    label: z.string().min(1, "Label is required"),
  });

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      label: "",
      // Additional fields will be added dynamically
    },
  });

  // Reset the config when the node changes
  useEffect(() => {
    if (node) {
      setConfig(node.config || {});
      methods.reset({
        label: node.config?.label || node.label || "",
      });

      // Set input and output data based on node execution history
      if (node.executionHistory && node.executionHistory.length > 0) {
        const latestExecution = node.executionHistory[0];
        setInputData(latestExecution.inputs || {});
        setOutputData(latestExecution.outputs || {});
      } else {
        setInputData(node.inputs || {});
        setOutputData(node.outputs || {});
      }
    }
  }, [node, methods]);

  if (!node || !isOpen) return null;

  const handleSave = (data: any) => {
    const updatedConfig = {
      ...config,
      ...data,
    };
    onSave(node.id, updatedConfig);
    onClose();
  };

  const updateConfig = (key: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
    methods.setValue(key as any, value);
  };

  // Get input schema for display
  const getInputSchema = () => {
    const schema = {};
    Object.entries(node.inputs || {}).forEach(([key, value]) => {
      schema[key] = { type: value.type };
    });
    return schema;
  };

  // Get output schema for display
  const getOutputSchema = () => {
    const schema = {};
    Object.entries(node.outputs || {}).forEach(([key, value]) => {
      schema[key] = { type: value.type };
    });
    return schema;
  };

  // Determine form fields based on node type
  const renderConfigFields = () => {
    if ("actionType" in node) {
      // Action node specific fields
      switch (node.actionType) {
        case "rest-get":
          return (
            <>
              <div className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="url" className="text-right">
                    URL
                  </Label>
                  <Input
                    id="url"
                    {...methods.register("url" as any)}
                    defaultValue={config.url || ""}
                    className="col-span-3"
                    onChange={(e) => updateConfig("url", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="method" className="text-right">
                    Method
                  </Label>
                  <Input
                    id="method"
                    {...methods.register("method" as any)}
                    defaultValue={config.method || "GET"}
                    className="col-span-3"
                    onChange={(e) => updateConfig("method", e.target.value)}
                  />
                </div>
              </div>
            </>
          );

        case "PythonCode":
        case "transform":
        case "function":
          return (
            <>
              <div className="space-y-4">
                <Label htmlFor="function" className="mb-2 block">
                  Code
                </Label>
                <div className="h-80 border">
                  <Editor
                    language="python"
                    value={config.function || config.code || ""}
                    onChange={(value) => updateConfig("code", value)}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                    }}
                  />
                </div>
              </div>
            </>
          );

        case "if-else":
          return (
            <>
              <div className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="expression" className="text-right">
                    Condition
                  </Label>
                  <Input
                    id="expression"
                    {...methods.register("expression" as any)}
                    defaultValue={config.expression || ""}
                    placeholder="e.g. value > 0"
                    className="col-span-3"
                    onChange={(e) => updateConfig("expression", e.target.value)}
                  />
                </div>
              </div>
            </>
          );

        default:
          // Default form for other action types
          return (
            <>
              <div className="space-y-4">
                {Object.entries(config).map(([key, value]) => {
                  // Skip common fields we handle separately
                  if (
                    [
                      "label",
                      "id",
                      "actionType",
                      "onConfigUpdate",
                      "inputs",
                      "outputs",
                    ].includes(key)
                  ) {
                    return null;
                  }

                  // Skip functions or complex objects
                  if (
                    typeof value === "function" ||
                    (typeof value === "object" && value !== null)
                  ) {
                    return null;
                  }

                  return (
                    <div
                      key={key}
                      className="grid grid-cols-4 items-center gap-4"
                    >
                      <Label
                        htmlFor={`config-${key}`}
                        className="text-right capitalize"
                      >
                        {key}
                      </Label>
                      <Input
                        id={`config-${key}`}
                        defaultValue={value as string}
                        {...methods.register(key as any)}
                        className="col-span-3"
                        onChange={(e) => updateConfig(key, e.target.value)}
                      />
                    </div>
                  );
                })}
              </div>
            </>
          );
      }
    }

    // Default form for base node
    return (
      <>
        <div className="space-y-4">
          {Object.entries(config).map(([key, value]) => {
            // Skip label since we handle it separately
            if (key === "label") return null;

            // Skip functions or complex objects
            if (
              typeof value === "function" ||
              (typeof value === "object" && value !== null)
            ) {
              return null;
            }

            return (
              <div key={key} className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor={`config-${key}`}
                  className="text-right capitalize"
                >
                  {key}
                </Label>
                <Input
                  id={`config-${key}`}
                  defaultValue={value as string}
                  {...methods.register(key as any)}
                  className="col-span-3"
                  onChange={(e) => updateConfig(key, e.target.value)}
                />
              </div>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!w-[90vw] !h-[90vh] p-0 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            {node.emoji && <span className="text-2xl">{node.emoji}</span>}
            <h2 className="text-xl font-semibold">{node.label}</h2>
            {node.category && <Badge variant="outline">{node.category}</Badge>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={methods.handleSubmit(handleSave)}>Save</Button>
          </div>
        </div>

        {/* Split pane container */}
        <Split
          className="flex flex-1 min-h-0"
          sizes={[30, 40, 30]}
          minSize={200}
          gutterSize={6}
          gutterAlign="center"
          dragInterval={1}
          direction="horizontal"
          cursor="col-resize"
        >
          {/* Left Panel - Input */}
          <div className="h-full w-full border-r overflow-auto flex flex-col">
            <div className="bg-muted/50 p-2 border-b">
              <h3 className="font-medium">Input</h3>
            </div>
            <Tabs
              value={activeInputTab}
              onValueChange={setActiveInputTab}
              className="flex flex-col h-[calc(100%-40px)]"
            >
              <TabsList className="w-full justify-start border-b rounded-none">
                <TabsTrigger value="schema">Schema</TabsTrigger>
                <TabsTrigger value="data">Data</TabsTrigger>
                <TabsTrigger value="json">JSON</TabsTrigger>
              </TabsList>
              <TabsContent
                value="schema"
                className="flex-1 overflow-auto p-4 mt-0"
              >
                <div className="space-y-2">
                  {Object.keys(node.inputs || {}).length > 0 ? (
                    Object.entries(node.inputs || {}).map(([key, value]) => (
                      <div key={key} className="border rounded-md p-3">
                        <div className="font-mono text-sm font-medium">
                          {key}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Type: {value.type}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-muted-foreground">
                      No input schema defined
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="data" className="flex-1 overflow-auto mt-0">
                <ScrollArea className="h-full">
                  {Object.keys(inputData).length > 0 ? (
                    <div className="p-4">
                      <ReactJson
                        src={inputData}
                        name={false}
                        theme="rjv-default"
                        collapsed={1}
                        displayDataTypes={false}
                      />
                    </div>
                  ) : (
                    <div className="p-4 text-muted-foreground">
                      No input data available
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
              <TabsContent value="json" className="flex-1 overflow-hidden mt-0">
                <div className="h-full border-t">
                  <Editor
                    language="json"
                    value={JSON.stringify(getInputSchema(), null, 2)}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 14,
                    }}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Middle Panel - Configuration */}
          <div className="h-full w-full flex flex-col overflow-auto">
            <div className="bg-muted/50 p-2 border-b">
              <h3 className="font-medium">Configuration</h3>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <FormProvider {...methods}>
                <form className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="label" className="text-right">
                      Label
                    </Label>
                    <Input
                      id="label"
                      {...methods.register("label")}
                      defaultValue={config.label || node.label}
                      className="col-span-3"
                      onChange={(e) => updateConfig("label", e.target.value)}
                    />
                  </div>

                  {/* Node specific configuration */}
                  <div className="space-y-4 mt-6">{renderConfigFields()}</div>
                </form>
              </FormProvider>
            </div>
          </div>

          {/* Right Panel - Output */}
          <div className="h-full w-full border-l overflow-auto flex flex-col">
            <div className="bg-muted/50 p-2 border-b">
              <h3 className="font-medium">Output</h3>
            </div>
            <Tabs
              value={activeOutputTab}
              onValueChange={setActiveOutputTab}
              className="flex flex-col h-[calc(100%-40px)]"
            >
              <TabsList className="w-full justify-start border-b rounded-none">
                <TabsTrigger value="schema">Schema</TabsTrigger>
                <TabsTrigger value="data">Data</TabsTrigger>
                <TabsTrigger value="json">JSON</TabsTrigger>
              </TabsList>
              <TabsContent
                value="schema"
                className="flex-1 overflow-auto p-4 mt-0"
              >
                <div className="space-y-2">
                  {Object.keys(node.outputs || {}).length > 0 ? (
                    Object.entries(node.outputs || {}).map(([key, value]) => (
                      <div key={key} className="border rounded-md p-3">
                        <div className="font-mono text-sm font-medium">
                          {key}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Type: {value.type}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-muted-foreground">
                      No output schema defined
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="data" className="flex-1 overflow-auto mt-0">
                <ScrollArea className="h-full">
                  {Object.keys(outputData).length > 0 ? (
                    <div className="p-4">
                      <ReactJson
                        src={outputData}
                        name={false}
                        theme="rjv-default"
                        collapsed={1}
                        displayDataTypes={false}
                      />
                    </div>
                  ) : (
                    <div className="p-4 text-muted-foreground">
                      No output data available
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
              <TabsContent value="json" className="flex-1 overflow-hidden mt-0">
                <div className="h-full border-t">
                  <Editor
                    language="json"
                    value={JSON.stringify(getOutputSchema(), null, 2)}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 14,
                    }}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </Split>
      </DialogContent>
    </Dialog>
  );
};

export default NodeInspector;
