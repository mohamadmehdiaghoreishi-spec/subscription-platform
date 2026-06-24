// src/core/routing/NodeSelector.ts

import { WorkerError } from "../errors/WorkerError";
import { ErrorCode } from "../../types/errors";

/**
 * NodeSelector
 *
 * Responsible for choosing the execution node
 * based on request characteristics.
 *
 * (MVP version - no real distributed system yet)
 */

export type NodeType = "default" | "premium" | "fallback";

export interface SelectedNode {
  type: NodeType;
  reason: string;
}

export class NodeSelector {
  async select(request: Request): Promise<SelectedNode> {
    const url = new URL(request.url);

    const isPremiumRoute = url.pathname.includes("/premium");
    const isFallbackRoute = url.searchParams.get("fallback") === "true";

    // Rule 1: fallback node
    if (isFallbackRoute) {
      return {
        type: "fallback",
        reason: "Requested via fallback flag",
      };
    }

    // Rule 2: premium routing
    if (isPremiumRoute) {
      return {
        type: "premium",
        reason: "Premium route detected",
      };
    }

    // Rule 3: default routing
    return {
      type: "default",
      reason: "Default routing applied",
    };
  }
}