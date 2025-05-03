import React from "react";
import { Link } from "react-router-dom";
import { GalleryHorizontal } from "lucide-react";
import { Layout, LayoutBody, LayoutHeader } from "@/components/ui/layout";
import WorkflowEditor from "@/components/WorkflowEditor";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export default function Index() {
  return (
    <Layout>
      <LayoutHeader className="border-b">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center font-bold text-xl">
              AIC Flow
            </Link>
            <span className="text-sm text-muted-foreground">v0.0.1</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/gallery">
              <Button variant="outline">
                <GalleryHorizontal size={16} className="mr-2" />
                Workflow Gallery
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </LayoutHeader>
      <LayoutBody className="p-0">
        <div className="h-[calc(100vh-4rem)]">
          <WorkflowEditor />
        </div>
      </LayoutBody>
    </Layout>
  );
}
