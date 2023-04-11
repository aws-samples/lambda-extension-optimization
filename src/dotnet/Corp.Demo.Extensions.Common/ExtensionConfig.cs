namespace Corp.Demo.Extensions.Common;
public readonly record struct ExtensionConfig(string ExtensionName, Uri RegisterUrl, Uri NextUrl, Uri InitErrorUr, Uri ShutdownErrorUrl);