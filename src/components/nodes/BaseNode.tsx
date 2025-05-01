import React, { useState } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

// Define BaseNodeData with correct typing
export interface BaseNodeData extends Record<string, unknown> {
  id: string;
  label: string;
  inputs: Record<string, { type: string; [key: string]: any }>;
  outputs: Record<string, { type: string; [key: string]: any }>;
  config: Record<string, any>;
  executionHistory?: Array<{
    timestamp: string;
    inputs: Record<string, any>;
    outputs: Record<string, any>;
  }>;
  onRun?: (nodeId: string, inputs: Record<string, any>, config: Record<string, any>) => Promise<Record<string, any>>;
  onConfigUpdate?: (nodeId: string, config: Record<string, any>) => void;
}

const BaseNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("config");
  const [config, setConfig] = useState<Record<string, any>>({});
  const nodeData = data as BaseNodeData;
  
  // Initialize execution history if it doesn't exist
  if (!nodeData.executionHistory) {
    nodeData.executionHistory = [];
  }
  
  // Initialize config state from node data
  React.useEffect(() => {
    setConfig(nodeData.config || {});
  }, [nodeData.config]);
  
  const handleRun = async () => {
    if (!nodeData.onRun || isRunning) return;
    
    setIsRunning(true);
    try {
      const inputs = nodeData.inputs;
      const outputs = await nodeData.onRun(id, inputs, nodeData.config);
      console.log(`Node ${id} outputs:`, outputs);
      
      // Record execution history (keep only the latest)
      nodeData.executionHistory = [{
        timestamp: new Date().toISOString(),
        inputs,
        outputs
      }];
      
    } catch (error) {
      console.error(`Error running node ${id}:`, error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleDoubleClick = () => {
    setShowDialog(true);
  };
  
  const handleConfigSave = () => {
    if (nodeData.onConfigUpdate) {
      nodeData.onConfigUpdate(id, config);
    }
    setShowDialog(false);
  };

  const latestHistory = nodeData.executionHistory && nodeData.executionHistory.length > 0
    ? nodeData.executionHistory[0]
    : null;

  return (
    <>
      <div 
        className={`px-4 py-2 rounded-md border-2 min-w-[180px] bg-white ${
          selected ? "border-blue-500" : "border-gray-200"
        }`}
        onDoubleClick={handleDoubleClick}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium text-sm">{nodeData.label}</div>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-6 w-6 p-0" 
            onClick={handleRun}
            disabled={isRunning}
          >
            <Play className="h-3 w-3" />
          </Button>
        </div>
        
        {/* Single Input handle */}
        <Handle
          id="input"
          type="target"
          position={Position.Left}
          className="w-2 h-2 bg-gray-400"
          style={{ top: 30 }}
        />
        
        {/* Single Output handle */}
        <Handle
          id="output"
          type="source"
          position={Position.Right}
          className="w-2 h-2 bg-gray-400"
          style={{ top: 30 }}
        />
      </div>

      {/* Combined Node Configuration and History Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{nodeData.label}</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="config" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="input">Input</TabsTrigger>
              <TabsTrigger value="config">Configuration</TabsTrigger>
              <TabsTrigger value="output">Output</TabsTrigger>
            </TabsList>
            
            {/* Input Tab */}
            <TabsContent value="input" className="p-4 border rounded-md">
              {latestHistory ? (
                <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                  {JSON.stringify(latestHistory.inputs, null, 2)}
                </pre>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No execution history available
                </div>
              )}
            </TabsContent>
            
            {/* Config Tab */}
            <TabsContent value="config" className="p-4 border rounded-md">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="node-label" className="text-right">Label</Label>
                  <Input 
                    id="node-label" 
                    value={config.label || nodeData.label} 
                    onChange={(e) => setConfig({...config, label: e.target.value})} 
                    className="col-span-3"
                  />
                </div>
                
                {/* Action node specific fields */}
                {'actionType' in nodeData && nodeData.actionType === 'http' && (
                  <>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="url" className="text-right">URL</Label>
                      <Input 
                        id="url" 
                        value={config.url || ''} 
                        onChange={(e) => setConfig({...config, url: e.target.value})} 
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="method" className="text-right">Method</Label>
                      <Input 
                        id="method" 
                        value={config.method || 'GET'} 
                        onChange={(e) => setConfig({...config, method: e.target.value})} 
                        className="col-span-3"
                      />
                    </div>
                  </>
                )}
                
                {'actionType' in nodeData && nodeData.actionType === 'function' && (
                  <>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="function" className="text-right">Function</Label>
                      <Textarea 
                        id="function" 
                        value={config.function || ''}
                        onChange={(e) => setConfig({...config, function: e.target.value})}
                        className="col-span-3"
                        rows={5}
                      />
                    </div>
                  </>
                )}
                
                <div className="flex justify-end">
                  <Button onClick={handleConfigSave}>Save</Button>
                </div>
              </div>
            </TabsContent>
            
            {/* Output Tab */}
            <TabsContent value="output" className="p-4 border rounded-md">
              {latestHistory ? (
                <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                  {JSON.stringify(latestHistory.outputs, null, 2)}
                </pre>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No execution history available
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BaseNode;
