#!/bin/bash
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

cd "$parent_path"

echo "Testing $1"

seq 1 5000 | xargs -P250 -I{} curl "$1" --user "$2":"$3" --aws-sigv4 "aws:amz:$4:execute-api" --silent --output /dev/null

echo "Done"