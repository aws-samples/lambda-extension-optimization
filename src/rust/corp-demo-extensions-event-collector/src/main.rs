use std::env;
use lambda_extension::Error;
use aws_sdk_s3::Client;
use aws_config;
use custom_event_processor::CustomEventProcessor;

mod custom_event_processor;

#[tokio::main]
async fn main() -> Result<(), Error> {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        // disable printing the name of the module in every log line.
        .with_target(false)
        // disabling time is handy because CloudWatch will add the ingestion time.
        .without_time()
        .init();

    let function_name: String = env::var("FUNCTION_NAME").expect("FUNCTION_NAME name must be set");
    let bucket_name = env::var("BUCKET_NAME").expect("BUCKET_NAME name must be set");

    let config = aws_config::load_from_env().await;
    let client = Client::new(&config);
    
    let processor = CustomEventProcessor::new(client, bucket_name, function_name);
    
    lambda_extension::run(processor).await
}