import { SelectedNode } from "../routing/NodeSelector";
import { D1SubscriptionRepository } from "../../infrastructure/d1/D1SubscriptionRepository";
import { SubscriptionEntity } from "../../domain/repositories/SubscriptionRepository";

export type ExecutionResult = {
  success: boolean;
  data: unknown;
};

export interface ExecutorEnvironment {
  DB: D1Database;
}

/**
 * ExecutorRegistry
 *
 * Executes subscription logic
 * and persists result through D1 repository
 */

export class ExecutorRegistry {
  private repository: D1SubscriptionRepository;

  constructor(env: ExecutorEnvironment) {
    this.repository = new D1SubscriptionRepository(env.DB);
  }

  async execute(
    node: SelectedNode,
    payload: unknown
  ): Promise<ExecutionResult> {

    const id =
      crypto.randomUUID?.() ??
      `sub_${Date.now()}`;

    const result: ExecutionResult = {
      success: true,
      data: {
        engine: this.resolveEngine(node.type),
        payload,
      },
    };


    const entity: SubscriptionEntity = {
      id,
      node: node.type,
      status: "created",
      payload: result,
      createdAt: new Date().toISOString(),
    };


    await this.repository.create(entity);


    return result;
  }


  private resolveEngine(nodeType: string): string {

    switch (nodeType) {

      case "premium":
        return "premium-executor";

      case "fallback":
        return "fallback-executor";

      default:
        return "default-executor";
    }
  }
}