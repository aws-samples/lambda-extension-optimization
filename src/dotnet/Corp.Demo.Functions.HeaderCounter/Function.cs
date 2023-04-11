using System.Net;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;

// Assembly attribute to enable the Lambda function's JSON input to be converted into a .NET class.
[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace Corp.Demo.Functions.HeaderCounter;

public class Function
{
    public async Task<APIGatewayProxyResponse> Handler(APIGatewayProxyRequest request)
    {
        Console.WriteLine("Corp.Demo.Functions.HeaderCounter.Function.FunctionHandler");

        // simulating compute operations here
        await Task.Delay(500);
        
        return new APIGatewayProxyResponse
        {
            Body = $"Your request has {request?.Headers?.Count.ToString() ?? "0"} headers",
            StatusCode = (int)HttpStatusCode.OK
        };
    }
}