// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

using System.Net;
using System.Text.Json;

namespace Corp.Demo.Extensions.Common;

/// <summary>
/// Lambda Extension API client
/// </summary>
internal class ExtensionClient : IExtensionClient
{
    private readonly ExtensionConfig _config;
    
    private readonly HttpClient _httpClient;

    private readonly IExtensionEventProcessor _eventProcessor;
    private readonly ISerializationHandler _serializationHandler;

    public ExtensionClient(string extensionName, IExtensionEventProcessor eventProcessor, ISerializationHandler serializationHandler)
    {
        _eventProcessor = eventProcessor ?? throw new ApplicationException("Extension event processor has to be supplied");
        _serializationHandler = serializationHandler ?? throw new ApplicationException(
            "Serialization handler has to be supplied");

        _httpClient = new HttpClient();
        // Set infinite timeout so that underlying connection is kept alive
        _httpClient.Timeout = Timeout.InfiniteTimeSpan;

        // Get Extension API service base URL from the environment variable
        var apiUri = new UriBuilder(Environment.GetEnvironmentVariable(Constants.LambdaRuntimeApiAddress)!).Uri;
        // Common path for all Extension API URLs
        var basePath = "2020-01-01/extension";

        _config = new ExtensionConfig(
            extensionName ?? throw new ArgumentNullException(nameof(extensionName), "Extension name cannot be null"),
            new Uri(apiUri, $"{basePath}/register"),
            new Uri(apiUri, $"{basePath}/event/next"),
            new Uri(apiUri, $"{basePath}/init/error"),
            new Uri(apiUri, $"{basePath}/exit/error")
        );
    }

    /// <summary>
    /// Extension registration and event loop handling
    /// </summary>
    public async Task ProcessEvents()
    {
        // Register extension with AWS Lambda Extension API to handle both INVOKE and SHUTDOWN events
        var registrationId = await RegisterExtensionAsync();

        var decorator = new ExtensionEventProcessorDecorator(registrationId, _config, _eventProcessor, _httpClient);
        
        await decorator.ProcessInitEvent(registrationId);

        // loop till SHUTDOWN event is received
        var hasNext = true;
        while (hasNext)
        {
            // get the next event type and details
            var (type, payload) = await GetNextAsync();

            switch (type)
            {
                case ExtensionEvent.INVOKE:
                    await decorator.ProcessInvokeEvent(payload);
                    break;
                case ExtensionEvent.SHUTDOWN:
                    // terminate the loop, invoke onShutdown function if there is any and report any unhandled exceptions to AWS Extension API
                    hasNext = false;
                    await decorator.ProcessShutdownEvent(payload);
                    break;
                default:
                    throw new ApplicationException($"Unexpected event type: {type}");
            }
        }
    }
    
    /// <summary>
    /// Register extension with Extension API
    /// </summary>
    /// <returns>Awaitable void</returns>
    /// <remarks>This method is expected to be called just once when extension is being registered with the Extension API.</remarks>
    private async Task<string> RegisterExtensionAsync()
    {
        var request = new HttpRequestMessage()
        {
            Method = HttpMethod.Post,
            RequestUri = _config.RegisterUrl,
            Headers = {
                { HttpRequestHeader.Accept.ToString(), "application/json" },
                { Constants.LambdaExtensionNameHeader, _config.ExtensionName }
            },
            Content = new StringContent(_serializationHandler.SerializeExtensionEvents(), System.Text.Encoding.UTF8, "application/json")
        };

        // POST call to Extension API
        using var response = await this._httpClient.SendAsync(request);

        // if POST call didn't succeed
        if (!response.IsSuccessStatusCode)
        {
            // log details
            Console.WriteLine($"[{_config.ExtensionName}] Error response received for registration request: {await response.Content.ReadAsStringAsync()}");
            // throw an unhandled exception, so that extension is terminated by Lambda runtime
            response.EnsureSuccessStatusCode();
        }
        
        var registrationId = response.Headers.GetValues(Constants.LambdaExtensionIdHeader).FirstOrDefault();
        
        if (string.IsNullOrEmpty(registrationId)) {
            throw new ApplicationException("Extension API register call didn't return a valid identifier.");
        }
        
        // configure all HttpClient to send registration id header along with all subsequent requests
        _httpClient.DefaultRequestHeaders.Add(Constants.LambdaExtensionIdHeader, registrationId);

        return registrationId;
    }
    
    private async Task<(ExtensionEvent type, string payload)> GetNextAsync()
    {
        var contentBody = await _httpClient.GetStringAsync(_config.NextUrl);

        // use JsonDocument instead of JsonSerializer, since there is no need to construct the entire object
        using var doc = JsonDocument.Parse(contentBody);

        // extract eventType from the reply, convert it to ExtensionEvent enum and reply with the typed event type and event content details.
        return new (Enum.Parse<ExtensionEvent>(doc.RootElement.GetProperty("eventType").GetString() ?? string.Empty), contentBody);
    }

    // IDisposable implementation as per https://learn.microsoft.com/en-us/dotnet/fundamentals/code-analysis/quality-rules/ca1063

    private bool _isDisposed;
    
    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }
    
    private void Dispose(bool disposing)
    {
        if (_isDisposed) {
            return;
        }

        if (disposing)
        {
            // free managed resources
            _httpClient.Dispose();
        }

        _isDisposed = true;
    }
}