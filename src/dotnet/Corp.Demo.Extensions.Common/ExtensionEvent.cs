// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

namespace Corp.Demo.Extensions.Common;

/// <summary>
/// Enum to define all possible event types, so that we do not deal with strings in the rest of the code.
/// </summary>
public enum ExtensionEvent
{
    INVOKE,
    SHUTDOWN,
}