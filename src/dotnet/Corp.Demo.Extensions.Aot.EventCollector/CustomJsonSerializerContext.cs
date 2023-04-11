using System.Text.Json.Serialization;
using Amazon.S3.Model;
using Corp.Demo.Extensions.Common;

namespace Corp.Demo.Extensions.Aot.EventCollector;

[JsonSerializable(typeof(List<string>))]
[JsonSerializable(typeof(Dictionary<string, string>))]
[JsonSerializable(typeof(HttpRequestMessage))]
[JsonSerializable(typeof(HttpResponseMessage))]
[JsonSerializable(typeof(ExtensionInvocationEvents))]
[JsonSerializable(typeof(ExtensionEvent))]
[JsonSerializable(typeof(PutObjectRequest))]
[JsonSerializable(typeof(PutObjectResponse))]
public partial class CustomJsonSerializerContext : JsonSerializerContext
{
}

public class ExtensionInvocationEvents
{
    [JsonPropertyName("events")]
    public string[]? Events { get; set; }
}