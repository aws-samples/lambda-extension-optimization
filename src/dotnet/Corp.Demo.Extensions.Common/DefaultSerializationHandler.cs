using System.Text.Json;
using System.Text.Json.Serialization;

namespace Corp.Demo.Extensions.Common;

internal sealed class DefaultSerializationHandler : ISerializationHandler
{
    public string SerializeExtensionEvents()
    {
        // custom options for JsonSerializer to serialize ExtensionEvent enum values as strings, rather than integers
        // thus we produce strongly typed code, which doesn't rely on strings
        var options = new JsonSerializerOptions();
        options.Converters.Add(new JsonStringEnumConverter());

        return JsonSerializer.Serialize(new
        {
            events = new [] {ExtensionEvent.INVOKE, ExtensionEvent.SHUTDOWN}
        }, options);
    }
}