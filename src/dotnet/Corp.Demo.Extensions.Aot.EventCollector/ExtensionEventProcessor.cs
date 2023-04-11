using System.Globalization;
using Corp.Demo.Extensions.Common;
using Amazon.S3;
using Amazon.S3.Model;

namespace Corp.Demo.Extensions.Aot.EventCollector;

public class ExtensionEventProcessor : IExtensionEventProcessor
{
    private readonly IAmazonS3 _s3Client;
    private readonly string _bucketName;
    private readonly string _functionName;

    public ExtensionEventProcessor(string bucketName, string functionName, IAmazonS3 s3Client)
    {
        _s3Client = s3Client ?? throw new ArgumentException("s3Client implementation has to be supplied.");
        _bucketName = bucketName ?? throw new ArgumentNullException(bucketName);
        _functionName = functionName ?? throw new ArgumentNullException(functionName);
    }

    public Task ProcessInitEvent(string eventPayload)
    {
        Console.WriteLine("AOT Extension: processing init.");
        
        // do nothing
        return Task.CompletedTask;
    }

    public async Task ProcessInvokeEvent(string eventPayload)
    {
        Console.WriteLine("AOT Extension: processing invoke.");
        
        var timestamp = DateTime.UtcNow.ToFileTimeUtc().ToString(CultureInfo.InvariantCulture);
        var key = $"{_functionName}/{timestamp}.json";
        
        var putRequest = new PutObjectRequest
        {
            BucketName = _bucketName,
            Key = key,
            ContentBody = eventPayload,
            ContentType = "application/json"
        };

        try
        {
            await _s3Client.PutObjectAsync(putRequest);
        }
        catch (ArgumentNullException ex)
        {
            Console.WriteLine($"Object is saved to S3 but cannot parse the response due to Native AOT trimming, {ex.Message}, {ex.InnerException?.Message}");
        }
    }

    public Task ProcessShutdownEvent(string eventPayload)
    {
        Console.WriteLine("AOT Extension: processing shutdown.");
        
        // do nothing
        return Task.CompletedTask;
    }
}