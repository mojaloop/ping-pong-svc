#!/bin/bash
set -euxo pipefail

source ./docker/env.sh

#docker load -i /tmp/docker-image.tar

docker-compose up -d

echo "==> running integration tests"
INTEGRATION_TEST_EXIT_CODE=0
npm run test:int || INTEGRATION_TEST_EXIT_CODE="$?"
echo "==> integration tests with fspiop adapter exited with code: $INTEGRATION_TEST_EXIT_CODE"

exit $INTEGRATION_TEST_EXIT_CODE
