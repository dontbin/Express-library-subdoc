#!/bin/bash

API="http://localhost:4741"
URL_PATH="/authors"

curl "${API}${URL_PATH}" \
  --include \
  --request POST \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer ${TOKEN}" \
  --data '{
    "author": {
      "name": {
        "firstName": "'"${FIRST}"'",
        "lastName": "'"${LAST}"'"
      },
      "dob": "'"${DOB}"'"
    }
  }'

echo
