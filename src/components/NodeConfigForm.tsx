
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BaseNodeData } from "./nodes/BaseNode";
import { ActionNodeData } from "./nodes/ActionNode";

// Use a union type for flexibility
type NodeData = BaseNodeData | ActionNodeData;

interface NodeConfigFormProps {
  isOpen: boolean;
  onClose: () => void;
  node: NodeData | null;
  onSave: (nodeId: string, config: Record<string, any>) => void;
}

const NodeConfigForm: React.FC<NodeConfigFormProps> = ({ isOpen, onClose, node, onSave }) => {
  const [config, setConfig] = useState<Record<string, any>>({});
  
  // Reset the config when the node changes
  useEffect(() => {
    if (node) {
      setConfig(node.config || {});
    }
  }, [node]);
  
  if (!node) return null;
  
  const handleSave = () => {
    onSave(node.id, config);
    onClose();
  };
  
  const updateConfig = (key: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  
  const renderConfigFields = () => {
    // This would be expanded based on the node type
    if ('actionType' in node) {
      // This is an ActionNode
      const actionNode = node as ActionNodeData;
      
      if (actionNode.actionType === 'http') {
        return (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="label" className="text-right">Label</Label>
                <Input 
                  id="label" 
                  value={config.label || node.label} 
                  onChange={(e) => updateConfig('label', e.target.value)} 
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="url" className="text-right">URL</Label>
                <Input 
                  id="url" 
                  value={config.url || ''} 
                  onChange={(e) => updateConfig('url', e.target.value)} 
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="method" className="text-right">Method</Label>
                <Input 
                  id="method" 
                  value={config.method || 'GET'} 
                  onChange={(e) => updateConfig('method', e.target.value)} 
                  className="col-span-3"
                />
              </div>
            </div>
          </>
        );
      }
      
      if (actionNode.actionType === 'function') {
        return (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="label" className="text-right">Label</Label>
                <Input 
                  id="label" 
                  value={config.label || node.label} 
                  onChange={(e) => updateConfig('label', e.target.value)} 
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="function" className="text-right">Function</Label>
                <Textarea 
                  id="function" 
                  value={config.function || ''} 
                  onChange={(e) => updateConfig('function', e.target.value)} 
                  className="col-span-3"
                />
              </div>
            </div>
          </>
        );
      }
    }
    
    // Default config fields for BaseNode
    return (
      <>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="label" className="text-right">Label</Label>
            <Input 
              id="label" 
              value={config.label || node.label} 
              onChange={(e) => updateConfig('label', e.target.value)} 
              className="col-span-3"
            />
          </div>
        </div>
      </>
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configure {node.label}</DialogTitle>
        </DialogHeader>
        
        {renderConfigFields()}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NodeConfigForm;
