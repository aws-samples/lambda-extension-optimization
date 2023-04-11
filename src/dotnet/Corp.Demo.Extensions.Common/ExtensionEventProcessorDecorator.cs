namespace Corp.Demo.Extensions.Common;

internal sealed class ExtensionEventProcessorDecorator : IExtensionEventProcessor
{
    private readonly IExtensionEventProcessor _extensionEventProcessor;
    private readonly HttpClient _httpClient;
    private readonly string _registrationId;
    private readonly ExtensionConfig _config;

    public ExtensionEventProcessorDecorator(string registrationId,
        ExtensionConfig config,
        IExtensionEventProcessor extensionEventProcessor,
        HttpClient httpClient)
    {
        _registrationId = registrationId;
        _config = config;
        _extensionEventProcessor = extensionEventProcessor;
        _httpClient = httpClient;
    }

    public async Task ProcessInitEvent(string eventPayload)
    {
        try
        {
            await _extensionEventProcessor.ProcessInitEvent(eventPayload);
        }
        catch (Exception ex)
        {
            await ReportErrorAsync(_config.InitErrorUr,"Fatal.Unhandled", ex);
        }
    }
    
    public async Task ProcessShutdownEvent(string eventPayload)
    {
        try
        {
            await _extensionEventProcessor.ProcessShutdownEvent(eventPayload);
        }
        catch (Exception ex)
        {
            await ReportErrorAsync(_config.ShutdownErrorUrl,"Fatal.Unhandled", ex);
        }
    }
    
    public async Task ProcessInvokeEvent(string eventPayload)
    {
        try
        {
            await _extensionEventProcessor.ProcessInvokeEvent(eventPayload);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Exception '{ex}' happened during extension '{_config.ExtensionName}' invocation.");
        }
    }
    
    private async Task ReportErrorAsync(Uri url, string errorType, Exception exception)
    {
        using var content = new StringContent(string.Empty);
        content.Headers.Add(Constants.LambdaExtensionIdHeader, _registrationId);
        content.Headers.Add(Constants.LambdaExtensionFunctionErrorTypeHeader, $"{errorType}.{exception.GetType().Name}");

        using var response = await _httpClient.PostAsync(url, content);
        if (!response.IsSuccessStatusCode)
        {
            Console.WriteLine($"[{_config.ExtensionName}] Error response received for {url.PathAndQuery}: {await response.Content.ReadAsStringAsync()}");
            response.EnsureSuccessStatusCode();
        }
    }
}