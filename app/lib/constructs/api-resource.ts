import { Construct } from "constructs";
import { AuthorizationType, IRequestValidator, LambdaIntegration, MethodOptions, Resource, RestApi } from "aws-cdk-lib/aws-apigateway";

import { ILambdaAdapter } from "./lambda-adapter";
import { NagSuppressions } from 'cdk-nag'

interface IApiResourceProps {
    api: RestApi,
    requestValidator: IRequestValidator;
    resourceName: string,
    lambdaAdapter: ILambdaAdapter,
}

class ApiResourceProps implements IApiResourceProps {
    api: RestApi;
    requestValidator: IRequestValidator;
    resourceName: string;
    lambdaAdapter: ILambdaAdapter;
}

export class ApiResourceBuilder {

    private props: IApiResourceProps = new ApiResourceProps();

    forApi(api: RestApi): ApiResourceBuilder {
        this.props.api = api;
        return this;
    }

    withResourceName(resourceName: string): ApiResourceBuilder {
        this.props.resourceName = resourceName;
        return this;
    }

    withBackend(lambda: ILambdaAdapter): ApiResourceBuilder {
        this.props.lambdaAdapter = lambda;
        return this;
    }

    withRequestValidator(validator: IRequestValidator): ApiResourceBuilder {
        this.props.requestValidator = validator;
        return this;
    }

    build(scope: Construct, id: string): IApiResource {
        return new ApiResource(scope, id, this.props);
    }
}

export interface IApiResource {
    resource: Resource;
    url: string,
    statsLambda: ILambdaAdapter;
}

class ApiResource extends Construct implements IApiResource {

    public readonly resource: Resource;
    public readonly url: string;
    public readonly statsLambda: ILambdaAdapter;

    constructor(scope: Construct, id: string, props: IApiResourceProps) {
        super(scope, id);

        this.resource = props.api.root.addResource(props.resourceName);

        const methodProps: MethodOptions = {
            requestValidator: props.requestValidator,
            authorizationType: AuthorizationType.IAM
        };

        const method = this.resource.addMethod('GET', new LambdaIntegration(props.lambdaAdapter.lambda, {
            proxy: true,
        }), methodProps);

        NagSuppressions.addResourceSuppressions(method, [
            {
                id: 'AwsSolutions-COG4',
                reason: 'We are not using Cognito',
            },
        ]);

        this.url = props.api.url + props.resourceName;
    }
}


