import { Construct } from 'constructs';
import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Code, LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda';

import { Constants } from '../core/constants';
import { Api } from './constructs/api';
import { ApiResourceBuilder } from './constructs/api-resource';
import { LambdaAdapterBuilder } from './constructs/lambda-adapter';
import { CodeAssets } from '../core/code-assets';
import { BlockPublicAccess, Bucket, BucketAccessControl, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { LambdaPerfDashboard } from './constructs/lambda-perf-dashboard';
import { AppContext } from '../core/app-context';

export class LambdaEventCollectorAotExtensionStack extends Stack {

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const eventsBucket = new Bucket(this, 'events-bucket', {
      encryption: BucketEncryption.S3_MANAGED,
      publicReadAccess: false,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      accessControl: BucketAccessControl.PRIVATE,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      serverAccessLogsPrefix: 'events-bucket-access-logs',
      enforceSSL: true
    });

    const rustEventCollectorExtension = new LayerVersion(this, 'rust-event-collector-extension-layer', {
      code: Code.fromAsset(CodeAssets.getRustEventCollectorExtensionAssetDir()),
      compatibleRuntimes: [Runtime.DOTNET_6, Runtime.PROVIDED_AL2],
      removalPolicy: RemovalPolicy.DESTROY
    });

    const dotnetEventCollectorExtension = new LayerVersion(this, 'dotnet-event-collector-aot-extension-layer', {
      code: Code.fromAsset(CodeAssets.getDotnetEventCollectorAotExtensionAssetDir()),
      compatibleRuntimes: [Runtime.DOTNET_6, Runtime.PROVIDED_AL2],
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const lambdaBuilderBase = new LambdaAdapterBuilder()
      .ofSize(AppContext.GetLambdaMemory(this.node))
      .withRuntime(Runtime.DOTNET_6)
      .withCodeAtPath(CodeAssets.getDotnetHeaderCounterFunctionAssetDir())
      .withEnvVariable("BUCKET_NAME", eventsBucket.bucketName)
      .withHandler(Constants.Resources.FunctionHandlers.HeaderCounterHandler);

    const lambdaWithNoExtensions = lambdaBuilderBase.copy().build(this, 'no-extensions-lambda');

    const rustFuncId = 'rust-event-collector-extension-lambda';

    const lambdaWithRustEventCollectorExtension = lambdaBuilderBase
      .copy()
      .withEnvVariable("FUNCTION_NAME", rustFuncId)
      .withExtension(rustEventCollectorExtension)
      .build(this, rustFuncId)
      .canWriteToBucket(eventsBucket);

    const dotnetFuncId = 'dotnet-event-collector-extension-lambda';

    const lambdaWithDotnetEventCollectorExtension = lambdaBuilderBase
      .copy()
      .withEnvVariable("FUNCTION_NAME", dotnetFuncId)
      .withExtension(dotnetEventCollectorExtension)
      .build(this, dotnetFuncId)
      .canWriteToBucket(eventsBucket);

    // API
    const extensionTestingAPI = new Api(this, 'extension-testing-api');

    const lambdaWithNoExtensionsResource = new ApiResourceBuilder()
      .forApi(extensionTestingAPI.api)
      .withResourceName('no-extension')
      .withRequestValidator(extensionTestingAPI.requestValidator)
      .withBackend(lambdaWithNoExtensions)
      .build(this, 'no-extension-resource');

    const lambdaWithRustEventCollectorExtensionResource = new ApiResourceBuilder()
      .forApi(extensionTestingAPI.api)
      .withResourceName('rust-extension')
      .withRequestValidator(extensionTestingAPI.requestValidator)
      .withBackend(lambdaWithRustEventCollectorExtension)
      .build(this, 'rust-event-collector-extension-resource');

    const lambdaWithDotnetEventCollectorExtensionResource = new ApiResourceBuilder()
      .forApi(extensionTestingAPI.api)
      .withResourceName('dotnet-extension')
      .withRequestValidator(extensionTestingAPI.requestValidator)
      .withBackend(lambdaWithDotnetEventCollectorExtension)
      .build(this, 'dotnet-event-collector-extension-resource');

    const dashboard = new LambdaPerfDashboard(this, 'lambda-perf-dashboard', {
      lambdas: [
        lambdaWithNoExtensions, lambdaWithDotnetEventCollectorExtension, lambdaWithRustEventCollectorExtension
      ]
    });

    new CfnOutput(this, Constants.Resources.Output.NoExtensionParam, { value: lambdaWithNoExtensionsResource.url });
    new CfnOutput(this, Constants.Resources.Output.DotnetExtensionParam, { value: lambdaWithDotnetEventCollectorExtensionResource.url });
    new CfnOutput(this, Constants.Resources.Output.RustExtensionParam, { value: lambdaWithRustEventCollectorExtensionResource.url });
  }
}
