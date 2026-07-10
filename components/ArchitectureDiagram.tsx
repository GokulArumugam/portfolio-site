"use client";

import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export interface ArchitectureDiagramProps {
  /** Nodes are passed through directly, making the component convenient to embed in MDX. */
  nodes: Node[];
  /** Edges connecting the supplied React Flow nodes. */
  edges: Edge[];
  /** Accessible description for the architecture visualization. */
  ariaLabel?: string;
}

export default function ArchitectureDiagram({
  nodes,
  edges,
  ariaLabel = "Architecture diagram",
}: ArchitectureDiagramProps) {
  return (
    <div className="flow-canvas" aria-label={ariaLabel}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          nodesConnectable={false}
          nodesDraggable={false}
          elementsSelectable={false}
          panOnDrag={false}
          zoomOnDoubleClick={false}
          zoomOnPinch={false}
          zoomOnScroll={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={18} size={1} color="#26313b" />
          <Controls showInteractive={false} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
