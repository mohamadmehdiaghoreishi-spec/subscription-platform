import {
  D1ApiKeyRepository,
  ApiKeyEntity
} from "../../infrastructure/d1/D1ApiKeyRepository";

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
    key: string
  ) {

    return this.repository.revoke(key);

  }

}