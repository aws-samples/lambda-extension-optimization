import { Node } from "constructs";
import { Constants } from "./constants";

export class AppContext {
    static GetLambdaMemory = (node: Node): number => {
        const value = node.tryGetContext(Constants.Resources.Configuration.LambdaMemory);
        if (!value) {
            return Constants.Resources.Configuration.LambdaMemoryDefault;
        }
        try {
            const timeout = Number(value);
            return timeout;
        }
        catch (err) {
            return Constants.Resources.Configuration.LambdaMemoryDefault;
        }
    }
}