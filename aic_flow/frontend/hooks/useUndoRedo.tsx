import { useCallback, useRef, useState } from "react";
import { Node, Edge } from "@xyflow/react";

interface HistoryState {
  nodes: Node[];
  edges: Edge[];
}

interface UseUndoRedoProps {
  nodes: Node[];
  edges: Edge[];
  onRestore: (state: HistoryState) => void;
  maxHistorySize?: number;
}

export function useUndoRedo({
  nodes,
  edges,
  onRestore,
  maxHistorySize = 100,
}: UseUndoRedoProps) {
  // Past states for undo
  const [past, setPast] = useState<HistoryState[]>([]);
  // Future states for redo
  const [future, setFuture] = useState<HistoryState[]>([]);

  // Flag to prevent taking snapshots during undo/redo operations
  const isUndoingRef = useRef(false);

  // Take a snapshot of the current state to enable undo
  const takeSnapshot = useCallback(() => {
    if (isUndoingRef.current) return;

    setPast((prevPast) => {
      const newPast = [
        ...prevPast,
        {
          nodes: JSON.parse(JSON.stringify(nodes)),
          edges: JSON.parse(JSON.stringify(edges)),
        },
      ];

      // Limit history size
      if (newPast.length > maxHistorySize) {
        return newPast.slice(1);
      }

      return newPast;
    });

    // Clear future when a new action is performed
    setFuture([]);
  }, [nodes, edges, maxHistorySize]);

  // Perform undo by going back to the previous state
  const undo = useCallback(() => {
    if (past.length === 0) return;

    isUndoingRef.current = true;

    const newPast = [...past];
    const previousState = newPast.pop();

    if (previousState) {
      setFuture((prevFuture) => [{ nodes, edges }, ...prevFuture]);

      setPast(newPast);
      onRestore(previousState);
    }

    isUndoingRef.current = false;
  }, [past, nodes, edges, onRestore]);

  // Perform redo by going forward to the next state
  const redo = useCallback(() => {
    if (future.length === 0) return;

    isUndoingRef.current = true;

    const newFuture = [...future];
    const nextState = newFuture.shift();

    if (nextState) {
      setPast((prevPast) => [...prevPast, { nodes, edges }]);

      setFuture(newFuture);
      onRestore(nextState);
    }

    isUndoingRef.current = false;
  }, [future, nodes, edges, onRestore]);

  // Check if undo/redo are possible
  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  return {
    undo,
    redo,
    takeSnapshot,
    canUndo,
    canRedo,
    past,
    future,
  };
}
