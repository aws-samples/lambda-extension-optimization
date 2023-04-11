import { Construct } from 'constructs';
import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Code, LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda';

import { Constants } from '../core/constants';
import { Api } from './constructs/api';
import { ApiResourceBuilder } from './constructs/api-resource';
import { LambdaAdapterBuilder } from './constructs/lambda-adapter';
import { CodeAssets } from '../core/code-assets';
import { LambdaPerfDashboard } from './constructs/lambda-perf-dashboard';
import { AppContext } from '../core/app-context';

export class LambdaBlankExtensionStack extends Stack {

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const dotnetBlankExtension = new LayerVersion(this, 'dotnet-blank-extension-layer', {
      code: Code.fromAsset(CodeAssets.getDotnetBlankExtensionAssetDir()),
      compatibleRuntimes: [Runtime.DOTNET_6],
      removalPolicy: RemovalPolicy.DESTROY
    });

    const rustBlankExtension = new LayerVersion(this, 'rust-blank-extension-layer', {
      code: Code.fromAsset(CodeAssets.getRustBlankExtensionAssetDir()),
      compatibleRuntimes: [Runtime.DOTNET_6, Runtime.PROVIDED_AL2],
      removalPolicy: RemovalPolicy.DESTROY
    });

    const lambdaBuilderBase = new LambdaAdapterBuilder()
      .ofSize(AppContext.GetLambdaMemory(this.node))
      .withRuntime(Runtime.DOTNET_6)
      .withCodeAtPath(CodeAssets.getDotnetHeaderCounterFunctionAssetDir())
      .withHandler(Constants.Resources.FunctionHandlers.HeaderCounterHandler);

    const lambdaWithNoExtensions = lambdaBuilderBase.copy().build(this, 'no-extensions-lambda');
    const lambdaWithBlankDotnetExtension = lambdaBuilderBase.copy().withExtension(dotnetBlankExtension).build(this, 'dotnet-blank-extension-lambda');
    const lambdaWithBlankRustExtension = lambdaBuilderBase.copy().withExtension(rustBlankExtension).build(this, 'rust-blank-extension-lambda');

    // API
    const extensionTestingAPI = new Api(this, 'extension-testing-api');

    const lambdaWithNoExtensionsResource = new ApiResourceBuilder()
      .forApi(extensionTestingAPI.api)
      .withResourceName('no-extension')
      .withRequestValidator(extensionTestingAPI.requestValidator)
      .withBackend(lambdaWithNoExtensions)
      .build(this, 'no-extension-resource');

    const lambdaWithDotnetBlankExtensionResource = new ApiResourceBuilder()
      .forApi(extensionTestingAPI.api)
      .withResourceName('dotnet-extension')
      .withRequestValidator(extensionTestingAPI.requestValidator)
      .withBackend(lambdaWithBlankDotnetExtension)
      .build(this, 'dotnet-blank-extension-resource');

    const lambdaWithRustBlankExtensionResource = new ApiResourceBuilder()
      .forApi(extensionTestingAPI.api)
      .withResourceName('rust-extension')
      .withRequestValidator(extensionTestingAPI.requestValidator)
      .withBackend(lambdaWithBlankRustExtension)
      .build(this, 'rust-blank-extension-resource');

    const dashboard = new LambdaPerfDashboard(this, 'lambda-perf-dashboard', {
      lambdas: [
        lambdaWithNoExtensions, lambdaWithBlankDotnetExtension, lambdaWithBlankRustExtension
      ]
    });

    new CfnOutput(this, Constants.Resources.Output.NoExtensionParam, { value: lambdaWithNoExtensionsResource.url });
    new CfnOutput(this, Constants.Resources.Output.DotnetExtensionParam, { value: lambdaWithDotnetBlankExtensionResource.url });
    new CfnOutput(this, Constants.Resources.Output.RustExtensionParam, { value: lambdaWithRustBlankExtensionResource.url });
  }
}
