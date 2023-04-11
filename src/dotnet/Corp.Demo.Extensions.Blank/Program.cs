using System.Reflection;
using Corp.Demo.Extensions.Common;

namespace Corp.Demo.Extensions.Blank;

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

        using var client = ExtensionClientFactory.Create(extensionName, new ExtensionEventProcessor(extensionName));

        // ProcessEvents will loop internally until SHUTDOWN event is received
        await client.ProcessEvents();
    }
}