// FILE: src/core/auth/ApiKeyService.ts
import {
  D1ApiKeyRepository,
  ApiKeyEntity
} from "../../infrastructure/d1/D1ApiKeyRepository";
import { WorkerError, ErrorCode } from "../errors/WorkerError";

export class ApiKeyService {

  constructor(
    private repository: D1ApiKeyRepository
  ) {}

  async create(
    ownerId: string
  ): Promise<ApiKeyEntity> {

    const key =
      crypto.randomUUID().replace(/-/g, "") +
      crypto.randomUUID().replace(/-/g, "");

    const entity: ApiKeyEntity = {

      id: crypto.randomUUID(),

      key,

      ownerId,

      status: "active",

      createdAt: new Date().toISOString()

    };

    return this.repository.create(entity);

  }

  async list(
    ownerId: string
  ) {

    return this.repository.list(ownerId);

  }

  async revoke(
    key: string,
    ownerId: string
  ) {

    const existing =
      await this.repository.findByKey(key);

    if (!existing || existing.ownerId !== ownerId) {

      throw new WorkerError({
        code: ErrorCode.FORBIDDEN,
        message: "You are not allowed to revoke this API key"
      });

    }

    return this.repository.revoke(key);

  }

}