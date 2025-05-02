import React from "react";
import WorkflowEditor from "@/components/WorkflowEditor";

const Index = () => {
  return (
    <div className="h-screen w-screen flex flex-col">
      <header className="bg-gray-800 text-white p-4">
        <h1 className="text-xl font-bold">Workflow Automation UI</h1>
      </header>
      <main className="flex-1 overflow-hidden">
        <WorkflowEditor />
      </main>
    </div>
  );
};

export default Index;
