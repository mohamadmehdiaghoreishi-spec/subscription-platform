import { WorkerError } from "../errors/WorkerError";
import { ErrorCode } from "../errors/ErrorCode";


export class PolicyResolver {


static check(request:Request){


const url = new URL(request.url);



if(
url.pathname === "/" ||
url.pathname.startsWith("/sub")
){

return true;

}



throw new WorkerError({

code:ErrorCode.FORBIDDEN,

message:"Access denied",

metadata:{
path:url.pathname
}

});


}



}