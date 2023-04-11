using System.Text.Json;
using System.Text.Json.Serialization;
using Corp.Demo.Extensions.Common;

namespace Corp.Demo.Extensions.Aot.EventCollector;

public sealed class SerializationHandler : ISerializationHandler
{
    private readonly JsonSerializerContext _serializationContext;
    
    public SerializationHandler()
    {
        _serializationContext = new CustomJsonSerializerContext(
            new JsonSerializerOptions() {
                PropertyNameCaseInsensitive = true
            });
    }
    
    public string SerializeExtensionEvents()
    {
        var events = new ExtensionInvocationEvents()
        {
            Events = new string[] {"INVOKE", "SHUTDOWN"}
        };

        return JsonSerializer.Serialize(events, typeof(ExtensionInvocationEvents), _serializationContext);
    }
    
}

