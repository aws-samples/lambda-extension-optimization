use std::{pin::Pin, future::{ready, Future}, task::Poll};
use lambda_extension::{Error, LambdaEvent, NextEvent, InvokeEvent, Service};
use aws_sdk_s3::Client;
use serde::{Serialize, Deserialize};
use serde_json;

#[derive(Clone)]
pub(crate) struct CustomEventProcessor {
    client: Client,
    bucket_name: String,
    function_name: String
}

impl CustomEventProcessor {
    pub fn new(client: Client, bucket_name: String, function_name: String) -> Self {
        CustomEventProcessor {
             client,
             bucket_name,
             function_name
        }
    }
}

impl Service<LambdaEvent> for CustomEventProcessor {
    type Response = ();
    type Error = Error;
    type Future = Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>> + Send>>;

    fn poll_ready(&mut self, _cx: &mut core::task::Context<'_>) -> core::task::Poll<Result<(), Self::Error>> {
        Poll::Ready(Ok(()))
    }

    fn call(&mut self, event: LambdaEvent) -> Self::Future {

        match event.next {
            NextEvent::Shutdown(e) => {
                println!("Rust Extension: Shutdown {:?}", e);
            }
            NextEvent::Invoke(e) => {
                println!("Rust Extension: Invoke {:?}", e);

                let key = format!("{}/{}.json", self.function_name, chrono::offset::Utc::now().timestamp_millis());
                let body = serde_json::to_vec(&CustomEvent::from(e));
                let f = self.client
                    .put_object()
                    .bucket(&self.bucket_name)
                    .key(&key)
                    .body(body.unwrap().into())
                    .content_type("application/json")
                    .send();

                return Box::pin(async move {
                    let _ = f.await?;
                    Ok(())
                });
            }
        }

        Box::pin(ready(Ok(())))
    }
}

#[derive(Serialize, Deserialize)]
pub(crate) struct CustomEvent {
    deadline_ms: u64,
    request_id: String,
    invoked_function_arn: String
}

impl CustomEvent {
    pub fn from(e: InvokeEvent) -> CustomEvent {
        CustomEvent { 
            deadline_ms: e.deadline_ms,
            request_id: e.request_id,
            invoked_function_arn: e.invoked_function_arn
        }
    }
}