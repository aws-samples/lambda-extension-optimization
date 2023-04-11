// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

namespace Corp.Demo.Extensions.Common;

internal sealed class Constants
{
    /// <summary>
    /// HTTP header that is used to register a new extension name with Extension API
    /// </summary>
    public static readonly string LambdaExtensionNameHeader = "Lambda-Extension-Name";

    /// <summary>
    /// HTTP header used to provide extension registration id
    /// </summary>
    /// <remarks>
    /// Registration endpoint reply will have this header value with a new id, assigned to this extension by the API.
    /// All other endpoints will expect HTTP calls to have id header attached to all requests.
    /// </remarks>
    public static readonly string LambdaExtensionIdHeader = "Lambda-Extension-Identifier";

    /// <summary>
    /// HTTP header to report Lambda Extension error type string.
    /// </summary>
    /// <remarks>
    /// This header is used to report additional error details for Init and Shutdown errors.
    /// </remarks>
    public static readonly string LambdaExtensionFunctionErrorTypeHeader = "Lambda-Extension-Function-Error-Type";

    /// <summary>
    /// Environment variable that holds server name and port number for Extension API endpoints
    /// </summary>
    public static readonly string LambdaRuntimeApiAddress = "AWS_LAMBDA_RUNTIME_API";
}