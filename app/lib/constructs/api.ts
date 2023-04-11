import { Construct } from "constructs";
import { IRequestValidator, LogGroupLogDestination, MethodLoggingLevel, RestApi } from "aws-cdk-lib/aws-apigateway";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";
import { RemovalPolicy } from "aws-cdk-lib";
import { ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { NagSuppressions } from "cdk-nag";

export class Api extends Construct {

    public readonly api: RestApi;
    public readonly requestValidator: IRequestValidator;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        const logGroup = new LogGroup(this, 'api-access-logs', {
            retention: RetentionDays.FIVE_DAYS,
            removalPolicy: RemovalPolicy.DESTROY
        });
        logGroup.grantWrite(new ServicePrincipal('apigateway.amazonaws.com'));

        this.api = new RestApi(this, "rest-api", {
            deployOptions: {
                stageName: 'demo',
                accessLogDestination: new LogGroupLogDestination(logGroup),
                loggingLevel: MethodLoggingLevel.ERROR,
                tracingEnabled: true,
            }
        });

        this.requestValidator = this.api.addRequestValidator('req-validator', {
            validateRequestBody: false,
            validateRequestParameters: true,
            requestValidatorName: "querystring-validator"
        });

        NagSuppressions.addResourceSuppressions(this.api, [
            {
                id: 'AwsSolutions-APIG2',
                reason: 'There is no need for a validator at the root level. Root requests result in a 403.'
            },
        ]);
    }
}
