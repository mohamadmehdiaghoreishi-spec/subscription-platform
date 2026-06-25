import { PlanType } from "../../core/plans/PlanTypes";


export class D1PlanRepository {


  constructor(
    private db:D1Database
  ){}




  async getBySubscription(
    subscriptionId:string
  ):Promise<PlanType>{


    const result =
      await this.db.prepare(
        `
        SELECT
          p.name
        FROM subscription_plans sp

        JOIN plans p
        ON p.id = sp.planId

        WHERE sp.subscriptionId = ?
        `
      )
      .bind(subscriptionId)
      .first<any>();



    if(!result){

      return PlanType.FREE;

    }



    return result.name as PlanType;

  }

}