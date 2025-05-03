import { useState, useCallback, useRef } from "react";
import { Node, Edge } from "@xyflow/react";

interface State {
  nodes: Node[];
  edges: Edge[];
}

interface UndoRedoOptions {
  nodes: Node[];
  edges: Edge[];
  onRestore: (state: State) => void;
  maxHistorySize?: number;
}

export const useUndoRedo = ({
  nodes,
  edges,
  onRestore,
  maxHistorySize = 100,
}: UndoRedoOptions) => {
  const [past, setPast] = useState<State[]>([]);
  const [future, setFuture] = useState<State[]>([]);
  const isUndoRedoing = useRef(false);

  const takeSnapshot = useCallback(() => {
    if (isUndoRedoing.current) {
      return;
    }

    setPast((prev) => {
      const newPast = [...prev, { nodes, edges }];
      if (newPast.length > maxHistorySize) {
        newPast.shift(); // Remove oldest if we exceed max size
      }
      return newPast;
    });
    setFuture([]); // Clear future when a new snapshot is taken
  }, [nodes, edges, maxHistorySize]);

  const undo = useCallback(() => {
    if (past.length === 0) {
      return;
    }

    isUndoRedoing.current = true;

    const newPresent = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    setPast(newPast);
    setFuture((prev) => [{ nodes, edges }, ...prev]);
    onRestore(newPresent);

    setTimeout(() => {
      isUndoRedoing.current = false;
    }, 100);
  }, [past, nodes, edges, onRestore]);

  const redo = useCallback(() => {
    if (future.length === 0) {
      return;
    }

    isUndoRedoing.current = true;

    const newPresent = future[0];
    const newFuture = future.slice(1);

    setPast((prev) => [...prev, { nodes, edges }]);
    setFuture(newFuture);
    onRestore(newPresent);

    setTimeout(() => {
      isUndoRedoing.current = false;
    }, 100);
  }, [future, nodes, edges, onRestore]);

  return {
    undo,
    redo,
    takeSnapshot,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
};
