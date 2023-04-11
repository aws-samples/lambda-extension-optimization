namespace Corp.Demo.Extensions.Common;

public static class ExtensionClientFactory
{
    public static IExtensionClient Create(string extensionName, IExtensionEventProcessor extensionEventProcessor, ISerializationHandler serializationHandler)
    {
        return new ExtensionClient(extensionName, extensionEventProcessor, serializationHandler);
    }
    
    public static IExtensionClient Create(string extensionName, IExtensionEventProcessor extensionEventProcessor)
    {
        return new ExtensionClient(extensionName, extensionEventProcessor, new DefaultSerializationHandler());
    }
}