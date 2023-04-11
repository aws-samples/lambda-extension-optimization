namespace Corp.Demo.Extensions.Common;

public interface IExtensionClient : IDisposable
{
    Task ProcessEvents();
}