#!/bin/bash
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

cd "$parent_path"

### publish dotnet ###

echo "Building .NET Lambda"

cd ../src/dotnet/Corp.Demo.Functions.HeaderCounter
dotnet publish Corp.Demo.Functions.HeaderCounter.csproj -c Release -r linux-x64 --no-self-contained

echo "Building .NET Event Collector extension using Native AOT"

cd ../../../src

docker run --rm -v $PWD:/src --name linux2-native-aot-build -i public.ecr.aws/sam/build-dotnet7:latest-x86_64 dotnet publish /src/dotnet/Corp.Demo.Extensions.Aot.EventCollector/Corp.Demo.Extensions.Aot.EventCollector.csproj -r linux-x64 -c Release --framework "net7.0" --self-contained true /p:GenerateRuntimeConfigurationFiles=true /p:StripSymbols=true

cd dotnet/Corp.Demo.Extensions.Aot.EventCollector/bin/Release/net7.0/linux-x64/publish

d="extensions"

rm -r -f $d

mkdir -p "$d" && mv corp-demo-extensions-aot-event-collector "$d" # move the executable to the ext file

rm -f corp-demo-extensions-aot-event-collector.dbg # remove the debug file in case it exists