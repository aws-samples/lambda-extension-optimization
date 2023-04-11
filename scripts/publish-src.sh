#!/bin/bash
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

cd "$parent_path"

### publish dotnet ###

echo "Building .NET Lambda"

cd ../src/dotnet/Corp.Demo.Functions.HeaderCounter
dotnet publish Corp.Demo.Functions.HeaderCounter.csproj -c Release -r linux-x64 --no-self-contained

echo "Building Blank Lambda .NET Extension"

cd ../Corp.Demo.Extensions.Blank
dotnet publish Corp.Demo.Extensions.Blank.csproj -c Release -r linux-x64 --no-self-contained

echo "Building Event Collector Lambda .NET Extension"

cd ../Corp.Demo.Extensions.EventCollector
dotnet publish Corp.Demo.Extensions.EventCollector.csproj -c Release -r linux-x64 --no-self-contained

###

### publish Rust extension ###

echo "Building Blank Extension written in Rust"

cd ../../rust/corp-demo-extensions-blank

cargo lambda build --release --extension

echo "Building Event Collector Extension written in Rust"

cd ../corp-demo-extensions-event-collector

cargo lambda build --release --extension

####