import { PlanType }
from "../../core/plans/PlanTypes";



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

      .bind(

        subscriptionId

      )

      .first<any>();





    if(!result){


      return PlanType.FREE;


    }





    return result.name as PlanType;



  }









  async assign(

    subscriptionId:string,

    plan:PlanType

  ):Promise<void>{





    const result =

      await this.db.prepare(

`
SELECT

id

FROM plans

WHERE name = ?

`

      )

      .bind(

        plan

      )

      .first<any>();







    if(!result){



      throw new Error(

        "Plan not found"

      );


    }








    await this.db.prepare(

`
INSERT INTO subscription_plans

(

id,

subscriptionId,

planId,

createdAt

)

VALUES

(

?,

?,

?,

?

)

`

    )

    .bind(


      crypto.randomUUID(),


      subscriptionId,


      result.id,


      new Date().toISOString()


    )

    .run();



  }





}