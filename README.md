# Optimizing Lambda extensions performance

## Prerequisites

To follow the solution walkthrough, you will need to:

1. An [AWS Account](https://aws.amazon.com/free/).
1. Set up the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) to deploy resources to your account.
1. Have the appropriate [AWS Credentials](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html) configured.
1. [Rust](https://www.rust-lang.org/tools/install), [Cargo Lambda](https://www.cargo-lambda.info/guide/getting-started.html), [dotnet sdk](https://github.com/dotnet/sdk), and [curl](https://everything.curl.dev/get) (version [7.75.0](https://curl.se/docs/manpage.html#--aws-sigv4) or higher) installed.
1. Install [Docker](https://docs.docker.com/get-docker/) on your machine.
1. Bootstrap your environment with [AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html).

## Solution Walkthrough

You can use your preferred IDE to deploy the solution. Refer to the cleanup section of this post for instructions to delete the resources to stop incurring any further charges.

### Setup

1. Clone the project repository to your local machine.

```zsh
git clone https://github.com/aws-samples/lambda-extesion-optimization.git
```

2. Navigate to the solution folder.

```zsh
cd lambda-extension-optimization/app/
```

3. Install the packages required.

```zsh
npm install
```

4. Store the AWS profile name in a variable.

```zsh
AWS_PROFILE="<AWS profile to be used>"
```

### Blank Lambda extension

1. Store the stack name in a variable.

```zsh
STACK_NAME="demo-blank-ext-stack"
```

2. Inspect the code.

- `HeaderCounter` [Lambda function](./src/dotnet/Corp.Demo.Functions.HeaderCounter/Function.cs) has a `500 ms` delay baked into it.
- `Blank` extension [written in .NET 6](./src/dotnet/Corp.Demo.Extensions.Blank/Program.cs) has a `corp-demo-extensions-blank` [shell script](./src/dotnet/Corp.Demo.Extensions.Blank/extensions/corp-demo-extensions-blank) that is responsible for running the extension. The extension is leveraging a [common library](./src/dotnet/Corp.Demo.Extensions.Common/ExtensionClient.cs) that is responsible for the extension registration and continuous operation.
- `Blank` extension [written in Rust](./src/rust/corp-demo-extensions-blank/src/main.rs) is leveraging `lambda-extension` [crate](https://crates.io/crates/lambda-extension) that is taking care of the extension registration and continuous operation.

3. Build the source files.

```zsh
../scripts/publish-src.sh
```

4. Deploy the [solution stack](./app/lib/lambda-blank-ext-stack.ts).

```zsh
cdk deploy $STACK_NAME --context lambda-memory=128 --profile $AWS_PROFILE
```

5. Store the endpoints into corresponding variables.

```zsh
API_URL_NO_EXT=$(aws cloudformation describe-stacks \
--stack-name $STACK_NAME \
--query "Stacks[0].Outputs[?OutputKey=='NoExtensionLambdaUrl'].OutputValue" \
--output text \
--profile $AWS_PROFILE)

echo $API_URL_NO_EXT

API_URL_DOTNET_EXT=$(aws cloudformation describe-stacks \
--stack-name $STACK_NAME \
--query "Stacks[0].Outputs[?OutputKey=='DotnetExtensionLambdaUrl'].OutputValue" \
--output text \
--profile $AWS_PROFILE)

echo $API_URL_DOTNET_EXT

API_URL_RUST_EXT=$(aws cloudformation describe-stacks \
--stack-name $STACK_NAME \
--query "Stacks[0].Outputs[?OutputKey=='RustExtensionLambdaUrl'].OutputValue" \
--output text \
--profile $AWS_PROFILE)

echo $API_URL_RUST_EXT
```

6. Load test the solution by running the `load-test.sh` script against the endpoints.

```zsh
ac=$(aws configure get aws_access_key_id --profile $AWS_PROFILE)
sc=$(aws configure get aws_secret_access_key --profile $AWS_PROFILE)
rg=$(aws configure get region --profile $AWS_PROFILE)

../scripts/load-test.sh $API_URL_NO_EXT $ac $sc $rg
../scripts/load-test.sh $API_URL_DOTNET_EXT $ac $sc $rg
../scripts/load-test.sh $API_URL_RUST_EXT $ac $sc $rg
```

7. Navigate to [Amazon CloudWatch](https://console.aws.amazon.com/cloudwatch/) (make sure you select the region where you stack is deployed).
8. Select `Dashboards` in the left-hand side menu.
9. Click on `lambda-performance-dashboard` to open the dashboard.
10. Inspect the results.
11. Clean up by deleting the CDK stack.

```zsh
cdk destroy $STACK_NAME --profile $AWS_PROFILE
```

### Event Collector Lambda extension

1. Store the stack name in a variable.

```zsh
STACK_NAME="demo-ec-ext-stack"
```

2. Inspect the code.

- `HeaderCounter` [Lambda function](./src/dotnet/Corp.Demo.Functions.HeaderCounter/Function.cs) has a `500 ms` delay baked into it.
- `EventCollector` extension [written in .NET 6](./src/dotnet/Corp.Demo.Extensions.EventCollector/Program.cs) has a `corp-demo-extensions-event-collector` [shell script](./src/dotnet/Corp.Demo.Extensions.EventCollector/extensions/corp-demo-extensions-event-collector) that is responsible for running the extension. The extension is leveraging a [common library](./src/dotnet/Corp.Demo.Extensions.Common/ExtensionClient.cs) that is responsible for the extension registration and continuous operation.
- `EventCollector` extension [written in Rust](./src/rust/corp-demo-extensions-event-collector/src/main.rs) is leveraging `lambda-extension` [crate](https://crates.io/crates/lambda-extension) that is taking care of the extension registration and continuous operation.

3. Build the source files.

```zsh
../scripts/publish-src.sh
```

4. Deploy the [solution stack](./app/lib/lambda-ec-ext-stack.ts).

```zsh
cdk deploy $STACK_NAME --context lambda-memory=128 --profile $AWS_PROFILE
```

5. Store the endpoints into corresponding variables.

```zsh
API_URL_NO_EXT=$(aws cloudformation describe-stacks \
--stack-name $STACK_NAME \
--query "Stacks[0].Outputs[?OutputKey=='NoExtensionLambdaUrl'].OutputValue" \
--output text \
--profile $AWS_PROFILE)

echo $API_URL_NO_EXT

API_URL_DOTNET_EXT=$(aws cloudformation describe-stacks \
--stack-name $STACK_NAME \
--query "Stacks[0].Outputs[?OutputKey=='DotnetExtensionLambdaUrl'].OutputValue" \
--output text \
--profile $AWS_PROFILE)

echo $API_URL_DOTNET_EXT

API_URL_RUST_EXT=$(aws cloudformation describe-stacks \
--stack-name $STACK_NAME \
--query "Stacks[0].Outputs[?OutputKey=='RustExtensionLambdaUrl'].OutputValue" \
--output text \
--profile $AWS_PROFILE)

echo $API_URL_RUST_EXT
```

6. Load test the solution by running the `load-test.sh` script against the endpoints.

```zsh
ac=$(aws configure get aws_access_key_id --profile $AWS_PROFILE)
sc=$(aws configure get aws_secret_access_key --profile $AWS_PROFILE)
rg=$(aws configure get region --profile $AWS_PROFILE)

../scripts/load-test.sh $API_URL_NO_EXT $ac $sc $rg
../scripts/load-test.sh $API_URL_DOTNET_EXT $ac $sc $rg
../scripts/load-test.sh $API_URL_RUST_EXT $ac $sc $rg
```

7. Navigate to [Amazon CloudWatch](https://console.aws.amazon.com/cloudwatch/) (make sure you select the region where you stack is deployed).
8. Select `Dashboards` in the left-hand side menu.
9. Click on `lambda-performance-dashboard` to open the dashboard.
10. Inspect the results.
11. Clean up by deleting the CDK stack.

```zsh
cdk destroy $STACK_NAME --profile $AWS_PROFILE
```

### Event Collector Native AOT Lambda extension

1. Store the stack name in a variable.

```zsh
STACK_NAME="demo-ec-aot-ext-stack"
```

2. Inspect the code.

- `HeaderCounter` [Lambda function](./src/dotnet/Corp.Demo.Functions.HeaderCounter/Function.cs) has a `500 ms` delay baked into it.
- `EventCollector` extension [written in .NET 7](./src/dotnet/Corp.Demo.Extensions.Aot.EventCollector/Program.cs) is compiled into an executable using the `publish-src-aot.sh` [shell script](./scripts/publish-src-aot.sh). The extension is leveraging a [common library](./src/dotnet/Corp.Demo.Extensions.Common/ExtensionClient.cs) that is responsible for the extension registration and continuous operation. The extension is using a [custom serializer](./src/dotnet/Corp.Demo.Extensions.Aot.EventCollector/CustomJsonSerializerContext.cs) required for the Native AOT compilation.
- `EventCollector` extension [written in Rust](./src/rust/corp-demo-extensions-event-collector/src/main.rs) is leveraging `lambda-extension` [crate](https://crates.io/crates/lambda-extension) that is taking care of the extension registration and continuous operation.

3. Make sure you have [public.ecr.aws/sam/build-dotnet7](https://gallery.ecr.aws/sam/build-dotnet7) image.

```zsh
# search for public.ecr.aws/sam/build-dotnet7
docker images -a
```

4. If the [public.ecr.aws/sam/build-dotnet7](https://gallery.ecr.aws/sam/build-dotnet7) is not present, pull the image.

```zsh
# make sure to select the right architecture
docker pull public.ecr.aws/sam/build-dotnet7:latest-x86_64 
```

5. Build the source files.

```zsh
../scripts/publish-src-aot.sh
```

6. Deploy the [solution stack](./app/lib/lambda-ec-ext-stack.ts).

```zsh
cdk deploy $STACK_NAME --context lambda-memory=128 --profile $AWS_PROFILE
```

> **Warning**
>
> Make sure you do not see this message: `[WARNING]: Cannot find EventCollector extension built using Native AOT. Falling back to the DLL`. You will need to fix the Native AOT build in case the message above appears.

7. Store the endpoints into corresponding variables.

```zsh
API_URL_NO_EXT=$(aws cloudformation describe-stacks \
--stack-name $STACK_NAME \
--query "Stacks[0].Outputs[?OutputKey=='NoExtensionLambdaUrl'].OutputValue" \
--output text \
--profile $AWS_PROFILE)

echo $API_URL_NO_EXT

API_URL_DOTNET_EXT=$(aws cloudformation describe-stacks \
--stack-name $STACK_NAME \
--query "Stacks[0].Outputs[?OutputKey=='DotnetExtensionLambdaUrl'].OutputValue" \
--output text \
--profile $AWS_PROFILE)

echo $API_URL_DOTNET_EXT

API_URL_RUST_EXT=$(aws cloudformation describe-stacks \
--stack-name $STACK_NAME \
--query "Stacks[0].Outputs[?OutputKey=='RustExtensionLambdaUrl'].OutputValue" \
--output text \
--profile $AWS_PROFILE)

echo $API_URL_RUST_EXT
```

8. Load test the solution by running the `load-test.sh` script against the endpoints.

```zsh
ac=$(aws configure get aws_access_key_id --profile $AWS_PROFILE)
sc=$(aws configure get aws_secret_access_key --profile $AWS_PROFILE)
rg=$(aws configure get region --profile $AWS_PROFILE)

../scripts/load-test.sh $API_URL_NO_EXT $ac $sc $rg
../scripts/load-test.sh $API_URL_DOTNET_EXT $ac $sc $rg
../scripts/load-test.sh $API_URL_RUST_EXT $ac $sc $rg
```

9. Navigate to [Amazon CloudWatch](https://console.aws.amazon.com/cloudwatch/) (make sure you select the region where you stack is deployed).
10. Select `Dashboards` in the left-hand side menu.
11. Click on `lambda-performance-dashboard` to open the dashboard.
12. Inspect the results.
13. Clean up by deleting the CDK stack.

```zsh
cdk destroy $STACK_NAME --profile $AWS_PROFILE
```

## Cost considerations

Make sure you follow the cleanup process to avoid any unexpected charges.

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.

> **Warning**
>
> You should not use this AWS Content in your production accounts, or on production or other critical data. You are responsible for testing, securing, and optimizing the AWS Content, such as sample code, as appropriate for production grade use based on your specific quality control practices and standards.
