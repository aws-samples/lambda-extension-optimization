using System.Globalization;
using Corp.Demo.Extensions.Common;
using Amazon.S3;
using Amazon.S3.Model;

namespace Corp.Demo.Extensions.EventCollector;

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
        // do nothing
        return Task.CompletedTask;
    }

    public async Task ProcessInvokeEvent(string eventPayload)
    {
        var timestamp = DateTime.UtcNow.ToFileTimeUtc().ToString(CultureInfo.InvariantCulture);
        var key = $"{_functionName}/{timestamp}.json";
        
        var putRequest = new PutObjectRequest
        {
            BucketName = _bucketName,
            Key = key,
            ContentBody = eventPayload,
            ContentType = "application/json"
        };
        
        await _s3Client.PutObjectAsync(putRequest);
    }

    public Task ProcessShutdownEvent(string eventPayload)
    {
        // do nothing
        return Task.CompletedTask;
    }
}