import { SelectedNode } from "../routing/NodeSelector";

import { D1SubscriptionRepository } from "../../infrastructure/d1/D1SubscriptionRepository";

import {
  SubscriptionEntity
} from "../../domain/repositories/SubscriptionRepository";



export type ExecutionResult = {

  success:boolean;

  data:unknown;

};




export class ExecutorRegistry {


  private repository:D1SubscriptionRepository;




  constructor(
    repository:D1SubscriptionRepository
  ){

    this.repository =
      repository;

  }







  async createSubscription(

    node:SelectedNode,

    payload:unknown

  ):Promise<SubscriptionEntity>{



    return {

      id:
        crypto.randomUUID(),


      node:
        node.type,


      status:
        "created",


      payload,


      createdAt:
        new Date().toISOString()

    };


  }







  async persist(

    entity:SubscriptionEntity

  ):Promise<SubscriptionEntity>{



    return this.repository.create(

      entity

    );

  }







  async execute(

    node:SelectedNode,

    payload:unknown

  ):Promise<ExecutionResult>{



    return {

      success:true,


      data:{


        engine:
          this.resolveEngine(
            node.type
          ),


        payload


      }


    };

  }







  async updateSubscriptionStatus(

    id:string,

    status:string

  ):Promise<void>{



    await this.repository.updateStatus(

      id,

      status

    );


  }







  private resolveEngine(

    nodeType:string

  ):string{



    switch(nodeType){



      case "premium":

        return "premium-executor";



      case "fallback":

        return "fallback-executor";



      default:

        return "default-executor";


    }


  }



}