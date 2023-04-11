namespace Corp.Demo.Extensions.Common;

public interface IExtensionEventProcessor
{
    Task ProcessInitEvent(string eventPayload);
    Task ProcessInvokeEvent(string eventPayload);
    Task ProcessShutdownEvent(string eventPayload);
}