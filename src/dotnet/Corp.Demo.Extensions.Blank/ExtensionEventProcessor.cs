using Corp.Demo.Extensions.Common;

namespace Corp.Demo.Extensions.Blank;

public class ExtensionEventProcessor : IExtensionEventProcessor
{
    private readonly string _extensionName;

    public ExtensionEventProcessor(string extensionName)
    {
        _extensionName = extensionName;
    }

    public async Task ProcessInitEvent(string eventPayload)
    {
        Console.WriteLine($"[{_extensionName}] Registered extension with id = {eventPayload}");
        await Task.CompletedTask;
    }

    public async Task ProcessInvokeEvent(string eventPayload)
    {
        Console.WriteLine($"[{_extensionName}] Handling invoke from extension: {eventPayload}");
        await Task.CompletedTask;
    }

    public async Task ProcessShutdownEvent(string eventPayload)
    {
        Console.WriteLine($"[{_extensionName}] Shutting down extension: {eventPayload}");
        await Task.CompletedTask;
    }
}