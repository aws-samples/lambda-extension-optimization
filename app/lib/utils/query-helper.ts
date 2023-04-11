import { ILambdaAdapter } from "../constructs/lambda-adapter";

export interface QueryFields {
    fieldSelector: String,
    fieldName: String
}

export class QueryHelper {

    public static replaceFieldValuesWithFriendlyNames = (accountId: string, lambdas: ILambdaAdapter[]): QueryFields => {

        let selector: String = "";
        let logField: String = "@log";
    
        for (let index = 0; index < lambdas.length; index++) {
          const variableName = `f${index}`;
          const statement = `replace(${logField}, "${accountId}:${lambdas[index].logGroup.logGroupName}", "${lambdas[index].friendlyName}") as ${variableName},`;
          selector = selector + statement;
          logField = variableName;
        }
    
         return {
            fieldSelector: selector.substring(0, selector.length - 1),
            fieldName: logField
         }
    }

}