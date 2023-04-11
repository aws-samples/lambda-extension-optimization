export namespace Constants {
    export namespace Resources {
        export namespace Assets {
            export class Dotnet {
                public static readonly HeaderCounterFunctionDir: string = "../../src/dotnet/Corp.Demo.Functions.HeaderCounter/bin/Release/net6.0/linux-x64/publish/";
                public static readonly BlankLambdaExtensionDir: string = "../../src/dotnet/Corp.Demo.Extensions.Blank/bin/Release/net6.0/linux-x64/publish/";
                public static readonly EventCollectorLambdaExtensionDir: string = "../../src/dotnet/Corp.Demo.Extensions.EventCollector/bin/Release/net6.0/linux-x64/publish/";    
                public static readonly EventCollectorAotLambdaExtensionDir: string = "../../src/dotnet/Corp.Demo.Extensions.Aot.EventCollector/bin/Release/net7.0/linux-x64/publish/";    
            }
            export class Rust {
                public static readonly BlankLambdaExtensionDir: string = "../../src/rust/corp-demo-extensions-blank/target/lambda";
                public static readonly EventCollectorLambdaExtensionDir: string = "../../src/rust/corp-demo-extensions-event-collector/target/lambda";
            }
        }
        export class Stacks {
            public static readonly BlankExtensionsStack: string = 'demo-blank-ext-stack';
            public static readonly EventCollectorExtensionStack: string = 'demo-ec-ext-stack';
            public static readonly EventCollectorAotExtensionStack: string = 'demo-ec-aot-ext-stack';
        }
        export class FunctionHandlers {
            public static readonly HeaderCounterHandler: string = "Corp.Demo.Functions.HeaderCounter::Corp.Demo.Functions.HeaderCounter.Function::Handler";
        }
        export class Configuration {
            public static readonly LambdaMemory: string = "lambda-memory";
            public static readonly LambdaMemoryDefault: number = 128;
        }
        export class Output {
            public static readonly NoExtensionParam: string = "NoExtensionLambdaUrl";
            public static readonly DotnetExtensionParam: string = "DotnetExtensionLambdaUrl";
            public static readonly RustExtensionParam: string = "RustExtensionLambdaUrl";

        }
    }
}
