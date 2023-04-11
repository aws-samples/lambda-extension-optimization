using System.Reflection;
using Corp.Demo.Extensions.Common;

using Amazon.S3;

namespace Corp.Demo.Extensions.Aot.EventCollector;

class Program
{  
    static async Task Main(string[] args)
    {
        var extensionName = (1 == args.Length)
            ? args[0]
            : Assembly.GetEntryAssembly()?.GetName()?.Name;
            
        if (string.IsNullOrWhiteSpace(extensionName)) {
            throw new InvalidOperationException("Failed to determine extension name!");
        }
    
        var bucketName = Environment.GetEnvironmentVariable("BUCKET_NAME");
        var functionName = Environment.GetEnvironmentVariable("FUNCTION_NAME");

        using var s3Client = new AmazonS3Client();
        using var client = ExtensionClientFactory.Create(extensionName,
            new ExtensionEventProcessor(bucketName!, functionName!, s3Client),
            new SerializationHandler());

        // ProcessEvents will loop internally until SHUTDOWN event is received
        await client.ProcessEvents();
    }
}