import { Construct } from "constructs";
import { Duration, RemovalPolicy, Stack } from "aws-cdk-lib";
import { CfnFunction, Code, Function, IFunction, ILayerVersion, Runtime, Tracing } from "aws-cdk-lib/aws-lambda";
import { ILogGroup, LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";
import { IRole, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { Policies } from "../permissions/Policies";

export interface ILambdaAdapterProps {
    runtime: Runtime,
    size: number,
    codePath: string,
    handler: string,
    env: { [key: string]: string },
    layers?: ILayerVersion[]
}

class LambdaAdapterProps implements ILambdaAdapterProps {
    runtime: Runtime;
    size: number;
    codePath: string;
    handler: string;
    env: { [key: string]: string };
    layers?: ILayerVersion[];
}

export class LambdaAdapterBuilder {
    private props: ILambdaAdapterProps = new LambdaAdapterProps();

    withRuntime(runtime: Runtime): LambdaAdapterBuilder {
        this.props.runtime = runtime;
        return this;
    }
    ofSize(sizeInMb: number): LambdaAdapterBuilder {
        this.props.size = sizeInMb;
        return this;
    }
    withCodeAtPath(codePath: string): LambdaAdapterBuilder {
        this.props.codePath = codePath;
        return this;
    }
    withHandler(handler: string): LambdaAdapterBuilder {
        this.props.handler = handler;
        return this;
    }
    withEnvVariable(key: string, value: string): LambdaAdapterBuilder {
        if (!this.props.env) {
            this.props.env = { [key]: value };
        } else {
            this.props.env[key] = value;
        }
        return this;
    }
    withExtension(layer: ILayerVersion): LambdaAdapterBuilder {
        if (!this.props.layers) {
            this.props.layers = [];
        }
        this.props.layers.push(layer);
        return this;
    }
    build(scope: Construct, id: string): ILambdaAdapter {
        return new LambdaAdapter(scope, id, this.props);
    }
    copy(): LambdaAdapterBuilder {
        const copy = new LambdaAdapterBuilder();
        copy.props = Object.assign({}, this.props);
        return copy;
    }
}

export interface ILambdaAdapter {
    lambda: IFunction;
    role: IRole,
    logGroup: ILogGroup;
    logicalId: string;
    friendlyName: string;

    canWriteToBucket(bucket: IBucket): ILambdaAdapter;
}

class LambdaAdapter extends Construct implements ILambdaAdapter {

    public readonly lambda: IFunction;
    public readonly role: IRole;
    public readonly logGroup: ILogGroup;
    public readonly logicalId: string;
    public readonly friendlyName: string;

    constructor(scope: Construct, id: string, props: ILambdaAdapterProps) {
        super(scope, id);

        this.friendlyName = id;

        this.role = new Role(this, 'role', {
            assumedBy: new ServicePrincipal('lambda.amazonaws.com')
        }).withoutPolicyUpdates();

        this.lambda = new Function(this, 'function', {
            role: this.role,
            runtime: props.runtime,
            tracing: Tracing.ACTIVE,
            timeout: Duration.seconds(30),
            code: Code.fromAsset(props.codePath),
            handler: props.handler,
            environment: props.env,
            layers: props.layers,
            memorySize: props.size
        });

        // we are creating LogGroup separately
        // so that it is deleted on cdk destroy
        this.logGroup = new LogGroup(this, 'function-log-group', {
            removalPolicy: RemovalPolicy.DESTROY,
            retention: RetentionDays.ONE_DAY,
            logGroupName: `/aws/lambda/${this.lambda.functionName}`
        });

        const stack = Stack.of(this);

        const cwPolicy = Policies.getInstance(stack).getOrCreateCloudWatchPolicy(this,  this.logGroup);
        cwPolicy.attachToRole(this.role);

        const xrayPolicy = Policies.getInstance(stack).getOrCreateXRayPolicy(this);
        xrayPolicy.attachToRole(this.role);


        this.logicalId = stack.getLogicalId(this.lambda.node.defaultChild as CfnFunction);
    }

    canWriteToBucket = (bucket: IBucket): ILambdaAdapter => {

        const stack = Stack.of(this);

        const policy = Policies.getInstance(stack).getOrCreateS3PutPolicy(this, bucket, this.friendlyName);

        policy.attachToRole(this.role);

        return this;
    };
}