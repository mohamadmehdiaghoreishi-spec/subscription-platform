import {
  D1ApiKeyRepository,
  ApiKeyEntity
} from "../../infrastructure/d1/D1ApiKeyRepository";


export class ApiKeyService {


  constructor(
    private repository:D1ApiKeyRepository
  ){}



  async create(
    subscriptionId:string
  ):Promise<ApiKeyEntity>{


    const key =
      crypto.randomUUID().replace(/-/g,"")
      +
      crypto.randomUUID().replace(/-/g,"");



    const entity:ApiKeyEntity = {

      id:
        crypto.randomUUID(),


      key,


      subscriptionId,


      status:
        "active",


      createdAt:
        new Date().toISOString()

    };



    return this.repository.create(entity);

  }





  async list(
    subscriptionId:string
  ){


    return this.repository.list(
      subscriptionId
    );


  }





  async revoke(
    key:string
  ){


    return this.repository.revoke(
      key
    );


  }


}