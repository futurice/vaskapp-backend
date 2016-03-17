#!/bin/bash
# NOTE: Run this only from project root!

# Run all commands and if one fails, return exit status of the last failed
# command

EXIT_STATUS=0

if [ ! -f .env-test ]; then
    echo "Loading env vars from .env-test-sample. Assuming secrets have been defined elsewhere.."
    source .env-test-sample || EXIT_STATUS=$?
else
    echo "Loading env vars from .env-test."
    source .env-test || EXIT_STATUS=$?
fi

echo -e "\n------ Checking dependencies with David.. These are only warnings!\n"
david

echo -e "\n--> Linting code..\n"
npm run jscs || EXIT_STATUS=$?
npm run eslint || EXIT_STATUS=$?

echo -e "\n--> Running tests..\n"
npm test || EXIT_STATUS=$?

exit $EXIT_STATUS
