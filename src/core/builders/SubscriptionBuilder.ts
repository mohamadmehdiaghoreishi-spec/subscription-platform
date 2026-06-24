// src/core/builders/SubscriptionBuilder.ts

import { SelectedNode } from "../routing/NodeSelector";
import { WorkerError } from "../errors/WorkerError";
import { ErrorCode } from "../../types/errors";

/**
 * SubscriptionBuilder
 *
 * Final step in pipeline:
 * transforms internal decision into client-ready response
 */

export interface SubscriptionResult {
  node: string;
  status: "success" | "failed";
  payload: unknown;
}

export class SubscriptionBuilder {
  async build(node: SelectedNode, request: Request): Promise<SubscriptionResult> {
    if (!node) {
      throw new WorkerError({
        code: ErrorCode.INTERNAL_ERROR,
        message: "Node is missing in SubscriptionBuilder",
        timestamp: new Date().toISOString(),
        metadata: {
          stage: "SubscriptionBuilder",
        },
      });
    }

    // Simple payload generation (MVP)
    const url = new URL(request.url);

    return {
      node: node.type,
      status: "success",
      payload: {
        message: "Subscription generated successfully 🚀",
        path: url.pathname,
        reason: node.reason,
      },
    };
  }
}