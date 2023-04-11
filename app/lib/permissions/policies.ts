import { Stack } from "aws-cdk-lib";
import { Effect, Policy, PolicyDocument, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { CfnLogGroup, ILogGroup } from "aws-cdk-lib/aws-logs";
import { CfnBucket, IBucket } from "aws-cdk-lib/aws-s3";
import { NagSuppressions } from "cdk-nag";
import { Construct } from "constructs";

export class Policies {

    /// Singleton implementation start

    private static instances: { [id: string]: Policies; } = {};

    private constructor() {}

    public static getInstance(stack: Stack): Policies {
        const stackName = stack.stackId;

        if (!Policies.instances[stackName]) {
            Policies.instances[stackName] = new Policies();
        }
        return Policies.instances[stackName];
    }

    /// Singleton implementation end

    private policies: { [id: string]: Policy; } = {};

    public getOrCreateS3PutPolicy = (scope: Construct, bucket: IBucket, folder: string) : Policy => {

        const stack = Stack.of(scope);
        const logicalId = stack.getLogicalId(bucket.node.defaultChild as CfnBucket);
        const policyId = `${logicalId}-${folder}-put-policy`;

        if (!this.policies[policyId]) {

            const policy = new Policy(scope, policyId, {
                document: this.generateS3PutPolicyDocument(bucket, folder)
            });

            NagSuppressions.addResourceSuppressions(policy, [
                {
                    id: 'AwsSolutions-IAM5',
                    reason: 'We need to put items under the <bucket.Arn>/<func-name>/*, hence allowing the "*" permission.',
                },
            ], true);
            
            this.policies[policyId] = policy;
        }

        return this.policies[policyId];
    }

    private generateS3PutPolicyDocument = (bucket: IBucket, folder: string): PolicyDocument => {
        return new PolicyDocument({
            statements: [
                new PolicyStatement({
                    effect: Effect.ALLOW,
                    resources: [
                        //bucket.bucketArn, 
                        `${bucket.bucketArn}/${folder}/*`
                    ],
                    actions: ['s3:PutObject']
                })
            ],
        });
    }

    public getOrCreateCloudWatchPolicy = (scope: Construct, logs: ILogGroup) : Policy => {

        const stack = Stack.of(scope);
        const logicalId = stack.getLogicalId(logs.node.defaultChild as CfnLogGroup);
        const policyId = `${logicalId}-put-policy`;

        if (!this.policies[policyId]) {

            const policy = new Policy(scope, policyId, {
                document: this.generateCloudWatchPolicyDocument(logs)
            });
            
            this.policies[policyId] = policy;
        }

        return this.policies[policyId];
    }

    private generateCloudWatchPolicyDocument = (logGroup: ILogGroup): PolicyDocument => {
        return new PolicyDocument({
            statements: [
                new PolicyStatement({
                    effect: Effect.ALLOW,
                    resources: [logGroup.logGroupArn], //this permission is generic to x-ray
                    actions: ['logs:CreateLogStream', 'logs:PutLogEvents']
                })
            ],
        });
    }

    public getOrCreateXRayPolicy = (scope: Construct) : Policy => {

        const stack = Stack.of(scope);
        const policyId = `${stack.stackName}-x-ray-allow-put`;

        if (!this.policies[policyId]) {

            const policy = new Policy(scope, policyId, {
                document: this.generateXRayPolicyDocument()
            });
            
            NagSuppressions.addResourceSuppressions(policy, [
                {
                    id: 'AwsSolutions-IAM5',
                    reason: '"*" permission needed for x-ray as per documentation. https://docs.aws.amazon.com/xray/latest/devguide/security_iam_service-with-iam.html',
                    appliesTo: ['Resource::*'],
                },
            ]);

            this.policies[policyId] = policy;
        }

        return this.policies[policyId];
    }

    private generateXRayPolicyDocument = (): PolicyDocument => {
        return new PolicyDocument({
            statements: [
                new PolicyStatement({
                    effect: Effect.ALLOW,
                    resources: ['*'], //this permission is generic to x-ray
                    actions: ['xray:PutTraceSegments', 'xray:PutTelemetryRecords']
                })
            ],
        });
    }
}